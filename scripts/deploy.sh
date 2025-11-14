#!/bin/bash
# TripTeller BE - 무중단 롤링 배포 (서버에서 로컬 빌드)
# 1) 서버에서 Docker 이미지 빌드 및 태깅
# 2) 새 컨테이너(신버전) 추가 -> 스케일 3
# 3) 전체 컨테이너 중 healthy >= 2개일 때까지 대기
# 4) 구버전 컨테이너(이전 이미지) 종료
# 5) scale 2로 정리 및 안정화 로그 출력 
# 6) 배포 완료 검증 및 불필요한 리소스 정리

set -euo pipefail

# ====== 설정 ======
PROJECT_DIR="/home/ubuntu/TripTeller_BE"
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="tripteller"
TIMEOUT=300           # 헬스 대기 타임아웃(초)
LOG_FILE="$PROJECT_DIR/deployment.log"

API_TAG="${1:-}"          # ex) 1.3.0-a1b2c3d  (필수)
[ -z "$API_TAG" ] && { echo "Usage: $0 <API_TAG>"; exit 1; }

# ====== 유틸 ======
log(){ echo "[$(date +'%F %T')] $1" | tee -a "$LOG_FILE"; }
die(){ log "ERROR: $1"; exit 1; }

# 새로운 컨테이너만 헬스체크 후 카운트
health_count(){
  local target_image="$1"
  local ids
  ids=$(docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps -q api)
  [ -z "$ids" ] && echo 0 && return

  local healthy=0
  for id in $ids; do
    local img status
    img=$(docker inspect --format '{{.Config.Image}}' "$id" 2>/dev/null || echo "")
    status=$(docker inspect --format '{{.State.Health.Status}}' "$id" 2>/dev/null || echo "")
    if [[ "$img" == "$target_image" && "$status" == "healthy" ]]; then
      ((healthy++))
    fi
  done
  echo "$healthy"
}

running_ids(){
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps -q api
}

container_image(){
  docker inspect --format '{{.Config.Image}}' "$1"
}

require_env_keys(){
  # 필수 키들이 .production.env에 존재하며 값이 비어있지 않은지 확인
  local env_file="$1"
  shift
  for key in "$@"; do
    if ! grep -E -q "^${key}=" "$env_file"; then
      die "Missing required env key: $key in $env_file"
    fi
    local val
    val="$(grep -E "^${key}=" "$env_file" | sed -E "s/^${key}=//")"
    if [ -z "$val" ]; then
      die "Empty value for env key: $key in $env_file"
    fi
  done
}

trap 'log "ERROR at line $LINENO: cmd=\"${BASH_COMMAND}\""; exit 1' ERR

# ====== 시작 ======
cd "$PROJECT_DIR"
log "Starting deployment - API_TAG=$API_TAG"

# (중요) 필수 파일 확인
[ -f "$COMPOSE_FILE" ] || die "$COMPOSE_FILE not found"
[ -s ".production.env" ] || die ".production.env not found or empty"

# (중요) 필수 ENV 키 유효성 검사 - 필요시 목록 추가
require_env_keys ".production.env" \
  "NODE_ENV" "MONGODB_URL" "SECRET_KEY" \
  "AWS_S3_ACCESSKEYID" "AWS_S3_SECRETACCESSKEY" "AWS_S3_REGION" "AWS_S3_BUCKET_NAME" \
  "KAKAO_CLIENT_ID" "KAKAO_CALLBACK_URL" "KAKAO_REDIRECT_URI" "COOKIE_DOMAIN"

# 로그 디렉토리 준비 (node UID=1000 권한)
mkdir -p logs/api logs/nginx
chown -R 1000:1000 logs/api || true

# ====== 1) 새 이미지 '서버 로컬 빌드' ======
log "Build new image locally"
export DOCKER_BUILDKIT=1
GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo local)"
docker build \
  -f deploy/prod.dockerfile \
  --build-arg BUILD_VERSION="$API_TAG" \
  --build-arg GIT_SHA="$GIT_SHA" \
  -t tripteller-api:$API_TAG \
  -t tripteller-api:latest \
  .

# ====== 2) 기준 상태 보장 (api 2개 + nginx) ======
log "Ensure baseline: api x2 + nginx"
export API_TAG="$API_TAG"  # compose에서 image: ...:${API_TAG:-latest}에 주입
if ! docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps nginx &>/dev/null; then
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --scale api=2 nginx
else
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --scale api=2 --no-recreate api
fi

# ====== 3) 스케일 아웃 (2 -> 3) ======
log "Scale out to 3"
docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --no-deps --scale api=3 --no-recreate api

# ====== 4) 헬스체크 대기 (>=2 healthy) ======
log "Wait for >=2 healthy containers"
start=$(date +%s)
while :; do
  hc=$(health_count || echo 0)
  elapsed=$(( $(date +%s) - start ))
  log "Healthy: $hc (elapsed ${elapsed}s)"
  if [ "$hc" -ge 2 ]; then
    log "Health condition satisfied"
    break
  fi
  if [ "$elapsed" -gt "$TIMEOUT" ]; then
    log "Timeout after ${TIMEOUT}s; scaling back to 2"
    docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --scale api=2 --no-recreate
    die "Health wait timeout"
  fi
  sleep 5
done

# ====== 5) 트래픽 전환(Nginx reload) 후 구버전 그레이스풀 종료 → scale 2 ======
TARGET_IMAGE="tripteller-api:${API_TAG}"
log "Prune old-image containers first (keep $TARGET_IMAGE)"

mapfile -t IDS < <(running_ids)
OLD_IDS=()
NEW_IDS=()
for id in "${IDS[@]}"; do
  img="$(container_image "$id")"
  if [[ "$img" == "$TARGET_IMAGE" ]]; then
    NEW_IDS+=("$id")
  else
    OLD_IDS+=("$id")
  fi
done

# 신버전이 최소 1개 healthy → Nginx 설정 검증 후 reload
log "Nginx config test..."
if docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" exec -T nginx nginx -t; then
  log "Reloading nginx..."
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" exec -T nginx nginx -s reload
  sleep 20   # 트래픽이 새 인스턴스로 넘어가도록 여유
else
  die "Nginx config test failed"
fi

# 현재 개수에서 2개만 남기도록, 우선 OLD부터 stop
TOTAL=${#IDS[@]}
TO_STOP=$(( TOTAL - 2 ))
for id in "${OLD_IDS[@]}"; do
  [ "$TO_STOP" -le 0 ] && break
  log "Gracefully stopping old-image container: $id"
  docker stop --time=30 "$id" >/dev/null
  TO_STOP=$(( TO_STOP - 1 ))
done

# 그래도 남으면(전부 신버전이었을 때 등) NEW에서 정리
if [ "$TO_STOP" -gt 0 ]; then
  for id in "${NEW_IDS[@]}"; do
    [ "$TO_STOP" -le 0 ] && break
    log "Stopping extra new container: $id"
    docker stop "$id" >/dev/null
    TO_STOP=$(( TO_STOP - 1 ))
  done
fi

# compose 상태를 2로 정렬
log "Normalize to scale=2"
docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --scale api=2 --no-recreate

# ====== 6) 검증/로그 ======
RUNNING=$(docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps -q api | wc -l | tr -d ' ')
log "Running api instances: $RUNNING"

# nginx 상태 (있으면)
if docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps nginx >/dev/null 2>&1; then
  nginx_up=$(docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps nginx | grep Up | wc -l | tr -d ' ')
  [ "$nginx_up" -eq 1 ] && log "Nginx is running" || log "WARNING: Nginx may not be running properly"
fi

log "Pruning unused images/containers"
docker image prune -af >/dev/null 2>&1 || true
docker container prune -f >/dev/null 2>&1 || true

log "Final images in use:"
docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps -q api \
  | xargs -r docker inspect --format '{{.Name}} -> {{.Config.Image}}' | tee -a "$LOG_FILE"

log "Deployment completed successfully"
echo "========================================"
echo "TripTeller 배포 완료: $(date +'%F %T')"
echo "배포 로그: $LOG_FILE"
echo "========================================"
