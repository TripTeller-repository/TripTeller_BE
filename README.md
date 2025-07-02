# 🌸TripTeller BackEnd Repository

<table>
  <tr>
    <td><b><a href="https://www.trip-teller.com/">배포 링크</a></b></td>
    <td><b><a href="https://github.com/TripTeller-repository">서비스 소개</a></b></td>
    <td><b><a href="https://api.trip-teller.com/api">스웨거</a></b></td>
    <td><b><a href="https://www.postman.com/tripteller/workspace/tripteller-prod/folder/32621611-481f263e-7597-4405-9cd9-9d0dfb22d124?action=share&creator=32621611&ctx=documentation">포스트맨</a></b></td>
    <td><b><a href="https://github.com/TripTeller-repository/TripTeller_BE/wiki/MongoDB-%EC%8A%A4%ED%82%A4%EB%A7%88">MongoDB 스키마</a></b></td>
    <td><b><a href="http://https://api.trip-teller.com/docs">Compodoc 문서</a></b></td>
  </tr>
</table>

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

| **분야**       | **세부 전략**                                                                 |
|----------------|-------------------------------------------------------------------------------|
| 🔐 **인증/인가**  | • 토큰에 IP/Device 등 정보 포함 <br> → 의심스러운 로그인 감지 시 선택적으로 Google Authenticator 2단계 인증 <br>• 리프레시 토큰: 쿠키 저장, 1시간 유효<br>• 액세스 토큰: 10분 유효, 자동 갱신 <br>• 카카오 소셜 로그인 지원 |
| 📦 **배포**      | • 초기: pm2 활용<br>• 후기: Docker 도입<br>• Docker 환경: 개발환경과 배포환경 분리 구성 <br> - 개발환경: 볼륨 마운트 + 개발모드로 빠른 개발 및 디버깅 <br> - 운영환경: 멀티 스테이지 빌드 + Nginx 프록시 + 롤링 배포로 안정성 확보 <br> - 무중단 배포: 헬스체크 기반 자동 롤백 및 점진적 인스턴스 교체 |
| 🏗️ **NestJS**   | • Interceptor를 통한 데이터 직렬화 (비밀번호 등)<br>• ConfigModule + Joi로 환경변수 관리 및 유효성 검증<br>• Lifecycle 원칙 준수<br>• class-validator 라이브러리 커스텀 검사 |
| 📊 **로깅**      | • 운영환경에서 Winston → Slack 실시간 알람<br>• 로그 레벨, 타임스탬프, 요청 ID, 사용자 ID 일관된 형식 |
| ⚠️ **에러 처리**  | • 서비스: 비즈니스 로직 커스텀 예외<br>• 컨트롤러: 기본 유효성 검증<br>• 글로벌: Exception Filter로 미처리 예외 캐치 |
| 📝 **문서화**     | • Swagger 활용<br>• Compodoc 활용 (전체 코드 문서화)<br>• JSDoc 활용 (세부 코드 주석 및 문서화) |
| 🖼️ **이미지**     | • Presigned URL 활용<br>• 프론트엔드 vs 서버 처리 비용/효율성 비교 <br>→ 비용 절감을 위해 프론트엔드에서 처리 |

---

## 이슈 해결

### 1. 로그인 전략

### 2. 배포 방식: pm2 vs docker

### 3. 이미지 리사이징: 프론트엔드 vs 백엔드