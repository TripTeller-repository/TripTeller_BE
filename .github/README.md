# 트립텔러 배포 워크플로우

- [아키텍처 다이어그램](#아키텍처-다이어그램)
- [appleboy/scp-action 선택 이유](#appleboyscp-action-선택-이유)
- [배포 워크플로우 개요](#배포-워크플로우-단계별-설명)

## 아키텍처 다이어그램

![Image](https://github.com/user-attachments/assets/25285a72-bbde-4801-8e20-cfded80c6651)

## appleboy/scp-action 선택 이유

- 간단한 설정: 최소한의 설정으로 빠르게 구현 가능
- 안정성: 널리 사용되는 검증된 GitHub Action
- SSH 기반 전송: EC2에 안전하게 파일을 전송할 수 있는 표준 프로토콜을 사용
- 다중 파일 전송: 여러 파일과 디렉토리를 한 번에 전송 가능
    - 공식 문서의 예제에서 확인 가능: `source: "tests/a.txt,tests/b.txt"`
    - 파이프 구문(|)을 사용한 다중 라인 YAML 형식으로 여러 파일과 디렉토리 패턴 지정 가능
    - 와일드카드 패턴(*)도 지원

## 배포 워크플로우 단계별 설명

- GitHub 저장소의 master 브랜치에 코드가 푸시되면, 자동으로 EC2 인스턴스에 배포가 이루어짐

### 1. 코드 체크아웃

- Github 저장소에서 트립텔러 서버의 최신 코드를 워크플로우 환경으로 가져옴

### 2. 앱 환경 변수 파일 생성

- production 환경에 필요한 환경 변수 파일(`.production.env`)을 Github Secrets에서 가져와 생성
- 우리 서버는 배포 환경에 필요한 환경 변수 개수가 적어서 github secrets에 수동으로 입력함
  - 환경 변수 개수가 많은 경우, 수동 입력 대신 환경 변수 파일을 한 번에 처리하는 자동화 방법을 고려할 수 있음

### 3. Docker 환경 변수 생성

- Docker 컨테이너 실행에 필요한 환경변수 파일(`.env`) 생성

### 4. 파일 복사(SCP)

- 위 2, 3번 과정에서 만들어놓은 것을 실제 ec2 인스턴스로 전송함
- 2번: ec2 서버 환경변수
- 3번: ec2 내 docker 컨테이너 환경변수
- 그밖에 전송되는 파일: Docker Compose 설정, Nginx 설정, 배포 스크립트 등

### 5. 원격 배포 실행(SSH)

- 서버 접속 정보(host 등)으로 EC2 인스턴스에 접속하여 배포 스크립트를 실행함
  - 코드 업데이트, 디렉토리 생성, 권한 설정 후 배포 스크립트 실행

## 주요 파라미터 설명

- appleboy/scp-action
  - `host`: EC2 인스턴스의 퍼블릭 IP 주소
  - `port`: SSH 접속 포트 (기본값 22)
  - `username`: EC2 인스턴스 접속 계정명 (일반적으로 ubuntu)
  - `key`: EC2 인스턴스 접속용 비공개 키
  - `source`: 복사할 파일/폴더 목록
  - `target`: 서버에 복사될 대상 경로 (디렉토리여야 함)

### 참고

- [🚀 SCP for GitHub Actions](https://github.com/appleboy/scp-action)
