FROM node:22-alpine

WORKDIR /usr/src/app

# 패키지 캐시 생성 후 설치
COPY package.json package-lock.json ./
RUN npm install

# 소스 복사
COPY . .

# 환경변수 설정
ENV NODE_ENV=development

EXPOSE 3000

# nest watch 모드로 실행
CMD ["npm", "run", "start:dev"]