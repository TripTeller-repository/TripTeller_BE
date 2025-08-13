#!/bin/bash
# 무중단 롤링 배포 (이미지 태그 주입 + pull 기반)
set -euo pipefail

# ====== 설정 ======
PROJECT_DIR="/home/ubuntu/TripTeller_BE"
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="tripteller"             # docker compose --project-name
TIMEOUT=300                           # 초
LOG_FILE="$PROJECT_DIR/deployment.log"

API_TAG="${1:-}"                      # 예: 1.3.0-a1b2c3d  (필수)
[ -z "$API_TAG" ] && { echo "Usage: $0 <API_TAG>"; exit 1; }

# ====== 유틸 ======
log() {
  local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg" | tee -a "$LOG_FILE"
}

die() {
  log "ERROR: $1"
  exit 1
}

health_count() {
  # api 서비스 컨테이너 중 healthy 상태 개수 카운트
  # (Health 없으면 제외)
  local count
  count=$(docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps -q api \
    | xargs -r docker inspect --format '{{.Name}} {{.State.Health.Status}}' 2>/dev/null \
    | awk '$2=="healthy"{c++} END{print c+0}')
  echo "${count:-0}"
}

running_count() {
  docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps -q api | wc -l | tr -d ' '
}

trap 'log "ERROR at line $LINENO: cmd=\"${BASH_COMMAND}\""; exit 1' ERR

# ====== 시작 ======
cd "$PROJECT_DIR"
log "Starting deployment - API_TAG=$API_TAG"

# 필수 파일 확인
for file in ".production.env" "$COMPOSE_FILE"; do
  [ -f "$file" ] || die "$file not found"
done

# 1) 최소 2개 유지 (최초엔 없을 수 있으니 up)
log "Ensuring 2 instances running"
export API_TAG="$API_TAG"  # compose에서 image: ...:${API_TAG:-latest} 사용
docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --scale api=2 --no-recreate || true

# 2) 새 이미지 pull
log "Pull new image"
docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" pull api

# 3) 스케일 아웃 2 -> 3
log "Scale out to 3"
docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --no-deps --scale api=3 --no-recreate api

# 4) 헬시 대기 (최소 2개 이상 healthy 보장)
log "Waiting for >=2 healthy containers"
start_time=$(date +%s)
while true; do
  hc=$(health_count || echo 0)
  elapsed=$(( $(date +%s) - start_time ))
  log "Healthy: $hc / Running: $(running_count) (elapsed ${elapsed}s)"
  if [ "$hc" -ge 2 ]; then
    log "Health condition satisfied"
    break
  fi
  if [ "$elapsed" -gt "$TIMEOUT" ]; then
    log "Deployment timed out after ${TIMEOUT}s, rolling back to 2 instances"
    docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --scale api=2 --no-recreate
    die "Timeout"
  fi
  sleep 5
done

# 5) 안정화 대기 후 스케일 인
log "Stabilizing for 10s before scale in"
sleep 10

log "Scale in to 2"
docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" up -d --scale api=2 --no-recreate

# 6) 검증
running=$(running_count)
log "Running api instances: $running"
if [ "$running" -ne 2 ]; then
  log "WARNING: Expected 2 instances, got $running"
fi

# 7) Nginx 상태 (있으면)
if docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps nginx >/dev/null 2>&1; then
  nginx_up=$(docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps nginx | grep Up | wc -l | tr -d ' ')
  if [ "$nginx_up" -eq 1 ]; then
    log "Nginx is running"
  else
    log "WARNING: Nginx may not be running properly"
  fi
fi

# 8) 정리 (사용 안 하는 이미지/컨테이너)
log "Pruning unused images/containers"
docker image prune -af >/dev/null 2>&1 || true
docker container prune -f >/dev/null 2>&1 || true

# 9) 최종 상태 로그(어떤 이미지가 도는지)
log "Final images in use for api:"
docker compose -f "$COMPOSE_FILE" --project-name "$PROJECT_NAME" ps -q api \
  | xargs -r docker inspect --format '{{.Name}} -> {{.Config.Image}}' | tee -a "$LOG_FILE"

log "Deployment completed successfully"
echo "========================================"
echo "TripTeller 배포 완료: $(date +'%Y-%m-%d %H:%M:%S')"
echo "배포 로그: $LOG_FILE"
echo "========================================"
