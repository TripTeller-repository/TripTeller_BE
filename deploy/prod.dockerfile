# ─────────────────────────────
# Build stage
# ─────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# 1) 의존성 레이어 캐시 최적화
COPY package.json package-lock.json ./
RUN npm ci

# 2) 소스 복사 및 빌드
COPY . .
RUN npm run build

# ─────────────────────────────
# Runtime stage
# ─────────────────────────────
FROM node:22-alpine

# (헬스체크용) curl 설치
RUN apk add --no-cache curl

WORKDIR /usr/src/app

# 프로덕션 의존성만 설치
# COPY package.json package-lock.json ./
# RUN --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev && npm prune --omit=dev

# devDependencies 포함해서 설치
RUN --mount=type=cache,target=/root/.npm npm ci

# 빌드 아티팩트만 복사
COPY --from=builder /usr/src/app/dist ./dist

# 메타데이터
ARG BUILD_VERSION=unknown
ARG GIT_SHA=unknown
LABEL org.opencontainers.image.title="TripTeller API" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.source="https://github.com/TripTeller-repository/TripTeller_BE"

# 내부 헬스체크 (도메인X, 로컬만)
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD curl -fsS http://localhost:3000/health-check >/dev/null || exit 1

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 비 루트 권한으로 실행
USER node

# 실행
CMD ["node", "dist/main.js"]