FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# 의존성 설치를 위한 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 소스 복사
COPY . .

# 빌드
RUN npm run build

# 프로덕션 이미지
FROM node:22-alpine

WORKDIR /usr/src/app

# 프로덕션 의존성만 설치하기 위한 파일 복사
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 빌드된 파일만 복사
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/.production.env ./

# 헬스체크 구성
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production

# 애플리케이션 실행
CMD ["node", "dist/main"]