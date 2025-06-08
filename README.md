# 🌸TripTeller BackEnd Repository

📌 <b><a href="https://www.trip-teller.com/">배포 링크</a></b><br> 📌 <b><a href="https://github.com/TripTeller-repository">서비스 소개</a></b><br> 📌 <b><a href="https://api.trip-teller.com/api">스웨거</a></b><br> 📌 <b><a href="https://www.postman.com/tripteller/workspace/tripteller-prod/folder/32621611-481f263e-7597-4405-9cd9-9d0dfb22d124?action=share&creator=32621611&ctx=documentation">포스트맨</a></b><br>
📌 <b><a href="https://github.com/TripTeller-repository/TripTeller_BE/wiki/MongoDB-%EC%8A%A4%ED%82%A4%EB%A7%88">MongoDB 스키마</a></b>

---

## 테스트 계정

> 이메일 : `trip@teller.com` <br>
> 비밀번호 : `letsgotrip1234!` <br>

---

## 바로가기

### 1. [프로젝트 개요](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#1-프로젝트-개요-1)
### 2. [프로젝트 아키텍쳐](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#2-프로젝트-아키텍쳐-1)
### 3. [구현 내용](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#3-구현-내용-1)
### 4. [이슈 해결](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#4-이슈-해결-1)

---

## 프로젝트 개요

### 🛠️ 기술스택

| 분야 | 기술스택 |
|------|----------|
| **💻 백엔드** | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) |
| **🚀 배포** | ![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Amazon EC2](https://img.shields.io/badge/Amazon%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white) ![Amazon ECR](https://img.shields.io/badge/Amazon%20ECR-FF9900?style=for-the-badge&logo=amazon&logoColor=white) ![Amazon S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white) |

| 기술 | 선정 이유 |
|------|-----------|
| **NestJS** | TypeScript 기반 체계적 아키텍처, 객체지향 및 DI 지원 |
| **MongoDB** | 스키마리스 구조로 유연한 데이터 모델링, 읽기 최적화 |
| **JWT** | 상태 비저장으로 서버 로드 감소, 빠른 인증 처리 |
| **AWS** | 광범위한 서비스 제공, 대량 트래픽 처리 용이 |
| **Docker** | 개발/배포 환경 일관성, 컨테이너 기반 효율적 배포 |

---

## 프로젝트 아키텍처

---

## 구현 내용 

| 분야 | 항목 | 세부 전략 |
|------|------|-----------|
| **📦 배포** | 인스턴스 배포 | • **초기**: pm2 활용<br>• **후기**: Docker 도입 |
| | Docker 환경 | • 개발환경과 배포환경 분리 구성 |
| **📊 로깅** | 수집 및 알림 | • Winston + CloudWatch → Slack 실시간 알람 |
| | 패턴 표준화 | • 로그 레벨, 타임스탬프, 요청 ID, 사용자 ID 일관된 형식 |
| | 모니터링 | • 에러율, 응답 시간, API 호출 빈도 대시보드 구성 |
| **⚠️ 에러 처리** | 계층별 처리 | • **서비스**: 비즈니스 로직 커스텀 예외<br>• **컨트롤러**: 기본 유효성 검증<br>• **글로벌**: Exception Filter로 미처리 예외 캐치 |
| **🏗️ NestJS** | 데이터 처리 | • Interceptor를 통한 데이터 직렬화 (비밀번호 등) |
| | 환경 설정 | • ConfigModule + joi로 환경변수 관리 및 유효성 검증 |
| | 개발 원칙 | • Lifecycle 원칙 준수 |
| | 유효성 검증 | • class-validator 라이브러리 커스텀 검사 |
| **💾 데이터베이스** | 트랜잭션 | • 트랜잭션 모듈 생성 후 update/create 작업 적용 |
| **📝 문서화** | API 문서 | • Swagger 활용 |
| | 코드 문서 | • Compodoc 활용 |
| **🔐 인증/인가** | 토큰 설계 | • 토큰에 IP/Device 정보 포함 |
| | 토큰 관리 | • **리프레시 토큰**: 쿠키 저장, 1시간 유효<br>• **액세스 토큰**: 10분 유효, 자동 갱신 |
| | 보안 강화 | • 의심스러운 로그인 3회 시 Google Authenticator 2단계 인증<br>• 카카오 소셜 로그인 지원 |
| **🖼️ 이미지** | 업로드 | • Presigned URL 활용 |
| | 리사이징 | • 비용 절감을 위해 프론트엔드에서 처리 (소규모 프로젝트) |

---

## 이슈 해결

### 1. 로그인 전략

### 2. 배포 방식: pm2 vs docker

### 3. 이미지 리사이징: 프론트엔드 vs 백엔드