#!/bin/bash

# 무중단 배포를 위한 스크립트
# 롤링배포 방식으로, 새 버전을 점진적으로 배포하고 헬스체크 후 이전 버전을 제거 

set -e

# 변수 설정
PROJECT_DIR="/home/ubuntu/TripTeller_BE"
COMPOSE_FILE="docker-compose.yml"
TIMEOUT=300  # 타임아웃 (초)
LOG_FILE="$PROJECT_DIR/deployment.log"

# 로그 함수
log() {
  local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg" | tee -a "$LOG_FILE"
}

# 프로젝트 디렉토리로 이동
cd $PROJECT_DIR
log "Starting deployment process"

# 필요한 파일 존재 확인 (.production.env)
for file in ".production.env" "$COMPOSE_FILE"; do
  if [ ! -f "$file" ]; then
    log "Error: $file file not found!"
    exit 1
  fi
done

# 현재 배포 상태를 백업
log "Backing up current state"
cp $COMPOSE_FILE ${COMPOSE_FILE}.bak
cp .production.env .production.env.bak

# 서비스 스케일링 - 2개의 API 인스턴스 유지
log "Scaling services to 2 instances"
docker-compose -f $COMPOSE_FILE up -d --scale api=2 --no-recreate

# 새 이미지 빌드
log "Building new image"
docker-compose -f $COMPOSE_FILE build --no-cache api

# 점진적 롤아웃
log "Starting rolling deployment (scaling to 3 instances)"
docker-compose -f $COMPOSE_FILE up -d --no-deps --scale api=3 --no-recreate api

# 새 컨테이너가 정상적으로 작동하는지 확인
log "Waiting for health check"
start_time=$(date +%s)
while true; do
  healthy_count=$(docker-compose -f $COMPOSE_FILE ps | grep api | grep "Up" | grep "(healthy)" | wc -l)
  current_time=$(date +%s)
  elapsed_time=$((current_time - start_time))
  
  if [ $healthy_count -ge 2 ]; then
    log "New containers are healthy!"
    break
  fi
  
  if [ $elapsed_time -gt $TIMEOUT ]; then
    log "ERROR: Deployment timed out after ${TIMEOUT}s!"
    log "Rolling back..."
    docker-compose -f $COMPOSE_FILE up -d --scale api=2 --no-recreate
    
    # 백업에서 복원
    mv ${COMPOSE_FILE}.bak $COMPOSE_FILE
    mv .production.env.bak .production.env
    
    log "Rollback completed"
    exit 1
  fi
  
  log "Waiting for containers to be healthy... (${elapsed_time}s elapsed)"
  sleep 5
done

# 이전 컨테이너 제거하기 전에 잠시 대기
log "Waiting for 10 seconds before scaling down"
sleep 10

# 서비스 스케일 다운
log "Scaling down to 2 instances to remove old containers"
docker-compose -f $COMPOSE_FILE up -d --scale api=2 --no-recreate

# 배포 결과 확인
api_count=$(docker-compose -f $COMPOSE_FILE ps | grep api | grep "Up" | wc -l)
if [ "$api_count" -eq 2 ]; then
  log "Deployment verification successful: $api_count instances running"
else
  log "WARNING: Expected 2 instances, but found $api_count instances running"
fi

# Nginx 상태 확인
log "Checking Nginx status"
nginx_status=$(docker-compose -f $COMPOSE_FILE ps | grep nginx | grep "Up" | wc -l)
if [ "$nginx_status" -eq 1 ]; then
  log "Nginx is running correctly"
else
  log "WARNING: Nginx may not be running properly"
fi

# 사용하지 않는 리소스 정리
log "Cleaning up unused resources"
docker image prune -af
docker container prune -f

# 백업 파일 제거
rm -f ${COMPOSE_FILE}.bak .production.env.bak

log "Deployment completed successfully!"
echo "========================================"
echo "TripTeller 배포가 완료되었습니다!"
echo "배포 완료: $(date +'%Y-%m-%d %H:%M:%S')"
echo "배포 로그: $LOG_FILE"
echo "========================================"