# 🌸TripTeller BackEnd Repository

> <b>"당신의 여행이 우리의 이야기가 되는 공간"</b>

> "여러분의 여행을 흥미로운 이야기로 바꿀 준비가 되셨나요?<br>
> 지금 여행을 시작하고, 트립텔러와 이야기를 공유하세요."

> 📌 <b>TripTeller URL</b> : https://www.trip-teller.com/<br>
> 📌 <b>TripTeller ReadMe</b> : https://github.com/TripTeller-repository<br>
> 📌 <b>BackEnd Github</b> : https://github.com/TripTeller-repository/TripTeller_BE

![리드미최상단](https://github.com/TripTeller-repository/TripTeller_BE/assets/127278410/b352ffe2-4031-4e95-91e8-544906929139)

---

## 🔷 바로가기

## 바로가기

#### 1. [프로젝트 개요](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#1-프로젝트-개요-1)
#### 2. [프로젝트 아키텍쳐](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#3-프로젝트-아키텍쳐-1)
#### 3. [구현 내용](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#4-구현-내용-1)
#### 4. [이슈 해결](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#5-이슈-해결-1)
#### 5. [배포](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#5-배포-1)
#### 6. [느낀점](https://github.com/TripTeller-repository/TripTeller_BE?tab=readme-ov-file#6-느낀점-1)

---

# 1. 프로젝트 개요<br>

- ### 기간 및 방식 <br>

  #### <b>기간</b>

  - <span>1차</span> : 기획 및 개발 (24.04.01 ~ 24.04.19) <i>[3주]</i><br>

  - <span>2차</span> : 리팩토링 (24.06.01 ~24.06.15) <i>[2주]</i><br>

  #### <b>진행 방식</b>

  | 구분 | 방식과 내용                                                                                                                                                                                                                                    |
  | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 1차  | • <b>방식</b> : 프론트엔드와 백엔드 담당자가 일정 기간 동안 함께 개발을 진행<br> • <b>위치</b> : (주)엘리스가 보유하고 있는 프라이빗 GitLab 저장소<br> • <b>내용</b> : 인증 및 인가 기능을 갖춘 기본 CRUD API 개발                             |
  | 2차  | • <b>방식</b> : 필요에 따라 특정 부분을 담당하는 팀원끼리 소통하여 추가적인 개발을 진행함.<br> • <b>위치</b> : 자율적으로 생성한 Github Organization<br> • <b>내용</b> : 인증 기능 고도화, 검색 API 추가, HTTPS 적용 배포, 로직 추상화 분리 등 |

  <br>

- ### 인원 및 역할 <br>

  - 백엔드 2명<br>

  | 이름   | 담당 업무                                                                                                                                                                                                 |
  | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 이가린 | • User, Authentication, Feed, Scrap, Search 스키마 및 API 생성<br> • Swagger 작성, 클라이언트 및 서버 자동 배포<br> • NestJS에서 제공하는 기능 활용(필터, 로거, 가드, 파이프, 미들웨어) 설정, 인증 고도화 |
  | 문채영 | • DailyPlan, DailySchedule, Expense, TravelLog 스키마 및 API 생성<br> • POSTMAN 및 Thunder Client로 API 테스트 후, 노션으로 문서화 진행                                                                   |

    <br>

- ### 기술스택 <br>

  - <b>백엔드</b> : Node.js, NestJS, MongoDB, TypeScript, JWT
  - <b>배포</b> : AWS S3, Route53, Cloudfront, EC2
  - <b>기타</b> : AWS presigned URL

| 기술           | 선정 이유                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <b>NestJS</b>  | • Express의 자유로운 구조에서 오는 설계 부담을 해소하고, <b>`TypeScript`</b>와 <b>`객체지향`</b> 기반의 체계적인 아키텍처를 제공하기 때문에 채택하였음. <br> • 또한 종속성 주입, 직관적인 CLI, TypeScript 지원 등 다양한 기능이 있어서 개발자의 편의를 돕는 다양한 기능을 제공함.                                                                                                                                                            |
| <b>MongoDB</b> | • 스키마리스(Schema-less) 구조로 <b>`읽기 연산`</b>에 최적화되어 있고, <b>`유연한 데이터 모델링`</b>이 가능하여 프로젝트의 잦은 스키마 변경 요구사항에 효과적으로 대응할 수 있다고 판단하여 채택함. |
| <b>JWT</b>     | • stateless(상태 비저장) 인증인 JWT는 <b>`서버 로드`</b>를 줄이고 인증 프로세스 속도를 높임.                                                                                                                                                                                                                                                                                                                 |
| <b>AWS</b>     | • AWS에서 웹 애플리케이션 호스팅 및 배포의 거의 모든 측면을 포괄하는 <b>`광범위한 서비스`</b>를 제공하며, <b>`대량의 트래픽 처리`</b>를 쉽게 할 수 있도록 설계되어 활용함.                                                                                                                                                                                                                              |

<br>

- ### 개발환경 <br>

  - <b>Node.js</b> : v20.9.0<br>
  - <b>Mongoose</b> : ^8.3.1<br>
  - <b>@nestjs/cli</b> : ^10.0.0<br>
  - <b>@nestjs/common</b> : ^10.3.8<br>
    <br>

- ### 관련 링크 <br>
  - <b>Swagger</b> : https://api.trip-teller.com/api
  - <b>POSTMAN</b> : https://www.postman.com/tripteller/workspace/tripteller-prod/folder/32621611-481f263e-7597-4405-9cd9-9d0dfb22d124?action=share&creator=32621611&ctx=documentation

---

# 2. 프로젝트 아키텍쳐<br>

### 전체 프로젝트 구조

![트립텔러구조(ver 2)](https://github.com/TripTeller-repository/TripTeller_BE/assets/127278410/758d47b3-3036-48e4-9aaf-af51ee00bbe6)
<br>
<br>

### MongoDB 스키마

![mongodb스키마](https://github.com/TripTeller-repository/TripTeller_BE/assets/127278410/c5805478-632d-4d37-8d1f-7c1d541bb07a)
Tool : Moon Modeler
<br>
<br>

### 로그인 시퀀스 다이어그램

Tool : Plant UML
<br>
<br>

### 카카오 로그인 시퀀스 다이어그램

Tool : Plant UML
<br>

# 3. 🔷 구현 내용<br>

> - Refresh Token과 Access Token을 활용한 JWT 기반 로그인 전략 구현
> - AWS Presigned URL을 활용한 이미지 업로드 처리
> - MongoDB의 가상 속성 및 페이징을 사용
> - 정렬, 검색 및 필터링 기능을 갖춘 데이터 관리
> - dotenv를 사용해 실행 환경에 따라 환경 변수를 다르게 설정
> - 리퀘스트와 에러를 Winston Logger로 로깅 처리

<br>

### 1. Refresh Token과 Access Token을 활용한 JWT 기반 로그인 전략 구현

<b>토큰 설명</b>
| 토큰 종류 | 반환 값 | 저장 메커니즘 | 만료 시간 |
|----------------|----------------|-----------------------------------|------------|
| <b>액세스 토큰</b> | 값 | HTTP 헤더 | 1 시간 |
| <b>리프레시 토큰</b> | 쿠키 | HTTP 헤더<br>(HttpOnly 옵션 사용) | 5 분 |

<b>절차</b>

1. 로그인이 성공하면 서버에서는 액세스토큰과 쿠키 안에 리프레시토큰을 발급해줌.
2. <b>`액세스토큰이 만료`</b>되면 서버에서 클라이언트로 "Access Token has expired." 오류 메시지를 보냄.
3. 클라이언트에서는 액세스토큰 재발급 요청을 보냄.
4. 서버에서는 쿠키의 리프레시토큰 검증 후 액세스토큰을 재발급함.
5. 만약 <b>리프레시토큰이 만료된 경우</b> 서버에서 클라이언트로 "Refresh Token has expired." 오류 메시지를 보냄.
6. 클라이언트에서는 로그인페이지로 리다이렉트를 함.<br>

<b>효과</b>

- <b>`짧은 액세스토큰`</b> : 훔친 토큰을 오용할 수 있는 기회를 줄일 수 있음.
- <b>`HttpOnly 쿠키`</b> : 리프레시 토큰을 쿠키에 담아 클라이언트 측의 액세스를 방지하여 XSS 공격을 완화함.
- <b>`토큰 순환`</b> : 잦은 빈도의 액세스 토큰 갱신으로 시스템 보안이 유지됨.  
  <br>

### 2. AWS Presigned URL을 활용한 이미지 업로드 처리

![트립텔러signedurl구조](https://github.com/TripTeller-repository/TripTeller_BE/assets/127278410/a41a053e-15ed-4224-bd76-82fb11b9c222)

- <b>이유</b>
  - 이미지 콘텐츠가 많은 서비스를 제공하는 웹사이트라서 별도의 클라우드 저장소 활용
  - multer를 사용하여 이미지를 업로드하는 방식은 프론트엔드에서 서버로 이미지를 직접 전달하여, 그것을 AWS에 그대로 업로드하는 방식임.
  - 따라서 서버 로드 및 리소스 소비가 증가할 수 있어서 대신 presigned url 방식을 채택함.
- <b>절차</b>

1. 서버에서 AWS SDK로 Pre-signed URL 생성<br>
   (파일 이름 중복 방지를 위해 유닉스 시간으로 파일 이름 생성)
2. 클라이언트에서 GET 요청을 통해 signed URL을 받아옴.
3. 클라이언트에서 받아온 signed URL을 body에 담아 PUT 요청을 통해 S3 버킷에 이미지를 업로드함.
4. S3에 업로드된 이미지의 URL을 클라이언트가 받아오기
5. 클라이언트에서 POST 요청을 통해 서버로 이미지 URL을 전송함.
6. 서버는 이미지 URL을 DB에 저장
   <br>
   <br>

### 3. MongoDB의 가상 속성 및 페이징을 사용

- <b>Mongoose의 가상속성(Virtuals)을 활용한 DB 일관성 및 저장 효율성 증가</b>
  - <b>설명</b> : TravelPlan 스키마의 startDate와 endDate는 실제로 MongoDB 도큐먼트에 저장되지 않는 동적 필드임. 이들은 도큐먼트에 접근할 때 계산되어 제공됨.
  - <b>효과</b> : startDate와 endDate를 별도로 저장하지 않음으로써, 일별 계획(DailyPlan)의 변경에 따라 자동으로 시작일과 종료일이 업데이트됨. 이를 통해 <u>데이터 일관성을 유지</u>할 수 있고, <u>직접 계산하는 복잡성을 줄이며</u>, <u>데이터 저장 공간을 절약</u>할 수 있음.
- <b>동시성 문제를 고려한 Mongoose 페이지네이션</b>
  - <b>`Aggregation Pipeline`</b> : MongoDB의 Aggregation Pipeline을 사용하여 트랜잭션 없이 일관된 데이터를 제공함.
  - <b>`$facet 스테이지`</b> : 단일 쿼리로 metadata와 data를 병렬로 처리하여 성능을 최적화함.
  - <b>`비동기 처리`</b> : async/await를 사용하여 비동기적으로 작업을 수행함으로써 Node.js의 이벤트 루프를 블록하지 않음.
    <br>
    <br>

<details>
<summary><i>가상속성(Virtuals) - travelPlan/travel-plan.schema.ts</i></summary>
<div markdown="1">

```
// startDate와 endDate를 가상 속성으로 정의
// 동적으로 계산하여 변경되며, 일반적인 필드처럼 접근 가능
const TravelPlanSchema = SchemaFactory.createForClass(TravelPlan);

// 가상 속성: 시작일
TravelPlanSchema.virtual('startDate').get(function (this: TravelPlan) {
  // 일별 일정 중 날짜 유형이 'DATE'인 것 필터링하여 날짜 배열 추출 후 정렬
  const dates = this.dailyPlans
    .filter((dailyPlan) => dailyPlan.dateType === 'DATE') // # => DailyPlan[]
    .map((dailyPlan) => dailyPlan.date) // # => Date[]
    .sort((a, b) => a.getTime() - b.getTime()); // # => Date[] 대신 정렬된 Date 배열

  // 가장 이른 날짜 반환
  return dates[0];
});

// 가상 속성: 종료일
TravelPlanSchema.virtual('endDate').get(function (this: TravelPlan) {
  // 일별 일정 중 날짜 유형이 'DATE'인 것 필터링하여 날짜 배열 추출 후 정렬
  const dates = this.dailyPlans
    .filter((dailyPlan) => dailyPlan.dateType === 'DATE') // # => DailyPlan[]
    .map((dailyPlan) => dailyPlan.date) // # => Date[]
    .sort((a, b) => a.getTime() - b.getTime()); // # => Date[] 대신 정렬된 Date 배열

  // 가장 늦은 날짜 반환
  return dates[dates.length - 1];
});
```

</div>
</details>

<details>
<summary><i>페이지네이션 - utils/feed-extractor.ts</i></summary>
<div markdown="1">

```
// 페이지네이션 설정하는 함수
  getFeedPaginated = async (pageNumber: number = 1, pageSize: number = 9, criteria: any = {}, sort: any = {}) => {
    const skip = (pageNumber - 1) * pageSize;

    try {
      // 기본 파이프라인 설정
      const pipeline: any[] = [{ $match: criteria }];

      // sort가 제공되었을 경우 정렬 단계 추가
      if (Object.keys(sort).length) {
        pipeline.push({ $sort: sort });
      }

      // 페이지네이션 설정
      pipeline.push({
        $facet: {
          metadata: [
            {
              $match: {
                $and: [
                  { travelPlan: { $ne: null } },
                  { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
                ],
              },
            },
            { $count: 'totalCount' },
          ],
          data: [{ $skip: skip }, { $limit: pageSize }],
        },
      });

      const feeds = await this.feedModel.aggregate(pipeline);

      const totalCount = feeds[0].metadata.length > 0 ? feeds[0].metadata[0].totalCount : 0;

      const result = {
        success: true,
        feeds: {
          metadata: { totalCount, pageNumber, pageSize },
          data: feeds[0].data,
        },
      };

      return result;
    } catch (error) {
      throw new Error('페이지네이션 작업이 실패하였습니다.');
    }
  };
```

</div>
</details>
<br>

### 4. 정렬, 검색 및 필터링 기능을 갖춘 데이터 관리

- 게시물 최신순/인기순 정렬 및 스크랩 API 구현
- 검색(제목, 작성자, 내용별) 기능 및 지역별 필터링 API 구현
- 다양한 스키마에서 데이터를 선택하고 추출, 정렬, 필터링하는 기능 구현
  - <b>이유</b> : 다양한 스키마에서 데이터를 추출하고, 이를 원하는 형태로 변환하여 사용자에게 제공하기 위함.
  - <b>효과</b> : 편리한 데이터 변환과 유연한 데이터 처리(추출된 데이터를 원하는 형태로 변환하여 사용자에게 제공할 수 있음.)

<details>
<summary><i>데이터 선택 추출, 정렬, 필터링 - utils/feed-extractor.ts</i></summary>
<div markdown="1">

```
  // 원하는 형태로 리턴값 추출
  extractFeeds = async (feeds: FeedDocument[], userId?: string) => {
    const extractFeed = async (feed: FeedDocument) => {
      const { likeCount, coverImage, isPublic } = feed;

      const travelPlanId = feed.travelPlan;
      const travelPlan = await this.travelPlanModel.findById(travelPlanId);

      // if (!travelPlan) return null;
      if (!travelPlan) {
        console.log(`Feed ${feed._id} has no associated travel plan.`);
        return null;
      }

      // 이 TravelPlan의 모든 DailySchedule을 가져옴
      const dailySchedules: DailySchedule[] = travelPlan['dailyPlans'] // => DailyPlan[]
        .map((dailyPlan) => dailyPlan.dailySchedules) // => DailySchedule[][]
        .flat(); // => DailySchedule[]

      let thumbnailUrl = null; // 썸네일 URL
      // DailySchedule 중 썸네일 이미지가 있고, isThumbnail이 true인 DailySchedule을 찾아 썸네일 URL을 추출
      const isThumbnailDailySchedule = dailySchedules.find((dailySchedule) => dailySchedule.isThumbnail);
      if (isThumbnailDailySchedule && isThumbnailDailySchedule.imageUrl) {
        thumbnailUrl = isThumbnailDailySchedule.imageUrl;
      }
      const startDate = travelPlan['startDate'];
      const endDate = travelPlan['endDate'];

      // isThumnbail이 true인 DailySchedule이 없을 경우
      // imgUrl이 있는 아무 DailySchedule을 찾아 썸네일 URL을 추출
      const dailySchedule = dailySchedules.find((dailySchedule) => dailySchedule.imageUrl);
      thumbnailUrl = dailySchedule?.imageUrl ?? null;

      // 해당 게시물 스크랩 여부 확인
      const isScrapped = await this.isScrappedByUser(feed._id.toString(), userId || null);

      return {
        feedId: feed._id, // 게시물 ID 값
        travelPlanId: feed.travelPlan['_id'], // travelPlan ID값
        travelPlan: feed.travelPlan, // travelPlan 데이터
        userId: feed.userId, // 회원 ID 값
        createdAt: feed.createdAt, // 게시물 작성일
        isPublic, // 공개 여부
        likeCount, // 좋아요(스크랩) 개수
        title: travelPlan['title'], // 제목
        region: travelPlan['region'] as RegionName, // 지역
        startDate, // 시작일
        endDate, // 종료일
        thumbnailUrl, // TravelLog 이미지 중 썸네일 URL
        coverImage, // 게시물 커버 이미지 URL
        isScrapped, // 해당 게시물 스크랩 여부
      };
    };

    return (
      await Promise.all(
        feeds.map(async (feed) => {
          const _extractedFeed = await extractFeed(feed);

          // 필터링 된 게시물 확인
          if (_extractedFeed === null) {
            console.log(`Feed ${feed._id} was filtered out.`);
          }
          return _extractedFeed;
        }), // => ExtractedFeed[]
      )
    ).filter((feed) => feed !== null); // null인 경우는 제외
  };
```

</div>
</details>
  <br>

### 5. dotenv를 사용해 실행 환경에 따라 환경 변수를 다르게 설정

- <b>설명</b> : Node.js 실행 환경을 기반으로 자동으로 적용되는 production 및 developmenet .env 파일을 각각 별도로 생성함. package.json에서 실행환경에 맞는 스크립트를 각각 설정함.
- <b>이유</b> : 배포환경과 로컬환경에서 필요한 정보들(쿠키 세팅값, 카카오 리다이렉트 URI 등)이 달라서 다르게 적용할 필요가 생김.
- <b>효과</b> : 다양한 환경에서 잘못된 설정을 사용할 위험을 줄이고 유지 관리를 용이하게 함.

<details>
<summary><i>서버 실행 환경에 따른 쿠키 환경 설정 - authentication/auth.controller.ts</i></summary>
<div markdown="1">

```
 // 쿠키 환경 설정
  private setRefreshTokenCookie(res: expRes, refreshToken: string) {
    const commonOptions = {
      domain: process.env.COOKIE_DOMAIN,
      maxAge: 60 * 60 * 1000, // 1시간
    };

    let additionalOptions = {};

    // 배포환경
    if (process.env.NODE_ENV === 'production') {
      additionalOptions = {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
      };
      // 개발 환경
    } else {
      additionalOptions = {
        httpOnly: false,
        sameSite: true,
      };
    }
    res.cookie('refreshToken', refreshToken, {
      ...commonOptions,
      ...additionalOptions,
    });
  }
```

</div>
</details>

<br>
<br>

### 6. 리퀘스트와 에러를 Winston Logger로 로깅 처리

- <b>사용자가 요청한 기록을 Logging</b>

  - <b>설명</b> : 로거 미들웨어를 설정하여 request를 로깅함.
  - <b>이유</b> : 내부 서버 오류보다는 잘못된 클라이언트 요청으로 인해 발생하는 오류를 식별할 수 있기 때문임.
  - <b>효과</b> : 가시성이 향상되고 문제 해결이 단순화됨.

- <b>Error가 발생했을 때 기록을 Logging</b>
  - <b>설명</b> : exception filter를 통해 오류가 발생한 위치에 대한 정보를 기록함.
  - <b>이유</b> : 오류를 더 쉽게 찾고 신속하게 해결하기 위함.
  - <b>효과</b> : 문제 해결 속도가 빨라짐.

<details>
<summary><i>리퀘스트 로깅 처리 - middlewares/logger.middleware.ts</i></summary>
<div markdown="1">

```
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const request = req as any;
    this.logger.info({
      message: 'Request',
      method: request.method,
      url: request.originalUrl,
      userAgent: request.headers['user-agent'],
      requestBody: request.body,
    });
    next();
  }
}
```

</div>
</details>
<details>
<summary><i>에러 로깅 처리 - utils/all-exceptions.filter.ts</i></summary>
<div markdown="1">

```
import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status: number;

    // HTTP 요청을 처리하는 동안 발생하는 예외
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      // 그렇지 않으면 서버 내부 오류로 처리
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    this.logger.error({
      message: 'An error occurred',
      error: exception.message,
      stack: exception.stack,
      request: {
        method: request.method,
        url: request.originalUrl,
        userAgent: request.headers['user-agent'],
        requestBody: request.body,
      },
    });

    response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
    });
  }
}

```

</div>
</details>

<br>

---

# 4. 이슈 해결<br>

### 1. 입력받는 여행 시작일과 종료일 데이터를 Mongoose 가상속성으로 변경

| 항목   | 내용                                                                                                                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상황   | • 사용자가 입력한 여행 시작일(startDate)과 종료일(endDate)를 travelPlan 스키마의 필드에 직접 넣어서 저장함. <br> • <b>`클라이언트 측`</b>에서 이 데이터를 받아서 매번 UI를 직접 동적으로 생성하였음.                                                                                                        |
| 문제   | • 해당 날짜가 자주 변경되거나 여러 문서에 동일한 데이터가 여러 개 표시되는 경우 <b>`데이터 중복`</b>이 발생할 수 있고, 입출력이 늘어남.<br> • 클라이언트 측에서는 사용자가 입력한 날짜를 수정할 때마다 직접 통신을 통해 변경된 데이터를 서버에서 받아와야 하므로, <b>`비효율적으로 API 호출을 자주`</b>하게 됨. |
| 해결   | • travelPlan 스키마의 startDate 및 endDate 필드를 <b>`가상 속성`</b>으로 활용함. 이러한 속성을 동적으로 계산함으로써 수동으로 날짜를 계산하고 입력할 필요가 없어짐.<br> • 이후 DailyPlan 스키마를 생성하여 <b>`날짜에 따른 하위 데이터의 입출력`</b>이 수월하게 이루어짐.                                         |
| 느낀점 | • 가상 스키마를 사용하면 유연하고 동적인 필드를 생성할 수 있음.<br>• 하지만 가상 속성을 사용할 때는 <b>`성능 및 데이터 무결성 문제`</b>를 고려해야 함.<br>ex) 기간별 조회 API 개발 시, startDate와 endDate를 직접 접근하지 못하여 쿼리문이 인식되지 않은 문제가 있었음.                                |

<br>

### 2. 동시성 문제를 고려하여 페이지네이션 쿼리를 수정

| 항목   | 내용                                                                                                                                                                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상황   | • skip 및 limit 메소드를 사용하여 페이지별로 게시물 조회하도록 함.                                                                                                                                                                                                                                        |
| 문제   | • 기존 코드는 두 개의 독립적인 요청을 보내는 구조로, 이로 인해 <b>`동시성 문제`</b>가 발생할 수 있음.<br> • 즉, 한 요청이 보내진 후에 그 사이에 데이터베이스 내용이 변경된다면, 해당 변경 사항이 반영되지 않음.<br> → <b>`데이터 일관성`</b>에 영향을 줄 수 있음.<br> (실제로 데이터가 일관되게 로드되지 않는 것을 확인함.) |
| 해결   | • <b>`aggregate 메소드`</b>를 사용하여 두 개의 쿼리를 한 번에 처리하도록 개선 <br> • <b>`$facet 연산자`</b>를 사용하여 메타데이터(총 게시물 수)와 실제 데이터 조회를 동시에 처리 <br> → 동시에 데이터 변경 사항을 정확히 반영할 수 있도록 처리.                                                     |
| 느낀점 | • 데이터 일관성을 유지하는 것이 매우 중요하며, 동시성 문제를 해결하는 방법이 성능 개선뿐만 아니라 시스템 안정성에도 큰 영향을 미친다는 점을 배움. <br> • 쿼리를 개선하는 과정에서 **aggregate**와 **$facet**의 유용성을 이해하게 되었음.                                       |

<details>
<summary><i>페이지네이션 쿼리 수정 전</i></summary>
<div markdown="1">

```
  // 본인이 작성한 모든 게시물 조회 (페이지네이션)
  async getAllFeedsPagination(userId: string, pageNumber: number = 1) {
    const pageSize = 9; // 한 페이지당 최대 게시물 수
    const skip = (pageNumber - 1) * pageSize;
    const criteria = {
      userId,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };
    try {
      const feeds = await this.feedModel.find(criteria).sort({ createdAt: -1 }).skip(skip).limit(pageSize).exec();
      return this.feedExtractor.extractFeeds(feeds);
    } catch (error) {
      throw error;
    }
  }

```

</div>
</details>
<details>
<summary><i>페이지네이션 쿼리 수정 후</i></summary>
<div markdown="1">

```
// 페이지네이션 설정하는 함수
  getFeedPaginated = async (pageNumber: number = 1, pageSize: number = 9, criteria: any = {}, sort: any = {}) => {
    const skip = (pageNumber - 1) * pageSize;

    try {
      // 기본 파이프라인 설정
      const pipeline: any[] = [{ $match: criteria }];

      // sort가 제공되었을 경우 정렬 단계 추가
      if (Object.keys(sort).length) {
        pipeline.push({ $sort: sort });
      }

      // 페이지네이션 설정
      pipeline.push({
        $facet: {
          metadata: [
            {
              $match: {
                $and: [
                  { travelPlan: { $ne: null } },
                  { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
                ],
              },
            },
            { $count: 'totalCount' },
          ],
          data: [{ $skip: skip }, { $limit: pageSize }],
        },
      });

      const feeds = await this.feedModel.aggregate(pipeline);

      const totalCount = feeds[0].metadata.length > 0 ? feeds[0].metadata[0].totalCount : 0;

      const result = {
        success: true,
        feeds: {
          metadata: { totalCount, pageNumber, pageSize },
          data: feeds[0].data,
        },
      };

      return result;
    } catch (error) {
      throw new Error('페이지네이션 작업이 실패하였습니다.');
    }
  };


```

</div>
</details>
<br>

### 3. 클라이언트 UI에 입력한 시간과 서버/DB 시간대 불일치 문제 해결

| 항목   | 내용                                                                                                                                                                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상황   | • 클라이언트(UI)에서 시간을 입력하여 저장했을 때, 실제로 <b>`입력하여 저장된 시간`</b>과 <b>`UI에서 표시되는 시간`</b>이 달랐음. <br> 예) KST - 오후 12시 38분(입력), UTC - 오전 3시 38분(저장)                  |
| 문제   | • <b>`클라이언트 측`</b>에서 UI에 입력된 시간을 KST로 변환한 후 서버에 넘기고, 서버에서 저장된 시간을 KST로 변환하려고 했으나, 시간이 예상대로 변환되지 않았음. <br> • 클라이언트에서 시간 변환 작업을 처리하려고 했지만, 이 과정에서 문제가 발생했고, 시간대 차이로 인해 UI에서 표시되는 시간과 DB에 저장된 <b>`시간이 일치하지 않는`</b> 문제가 계속 발생함. |
| 해결   | • <b>`서버/DB의 시간대 설정`</b>을 모두 Asia/Seoul(KST)로 맞추기로 함. <br> → 클라이언트에서 시간을 처리할 때 굳이 DB에서 가져온 시간을 변환할 필요 없어짐. <br> <b> 1) MongoDB Atlas 시간대 설정 변경 </b> <br>- MongoDB Atlas의 시간대를 Asia/Seoul(KST)로 변경하여, DB에 저장되는 시간이 자동으로 KST로 처리되도록 함. <br> <b> 2) EC2 인스턴스 시간대 설정 </b> <br> - EC2 인스턴스의 리눅스 시간대도 Asia/Seoul(KST)로 설정하였음. <br> <b> 3) PM2 시간대 설정 </b> <br> - 서버 시간대가 KST로 설정되었지만, PM2에서 실행되는 애플리케이션 로그는 여전히 UTC로 표시됨. <br> - ecosystem.config.js 파일을 설정하여, PM2에서 실행되는 애플리케이션의 시간대도 KST로 지정하고 재실행하였더니 문제가 해결됨.                                                 
| 느낀점 | • 시간대 관리가 단순한 변환을 넘어서 <b>`시스템 전반의 데이터 일관성과 신뢰성을 보장`</b>하는 요소임을 깨달음. <br> • 서버와 DB의 시간대를 통일하면, 클라이언트에서 변환 작업을 줄이고, 추후 글로벌 서비스 확장 시에도 효율적이고 일관된 시스템을 유지할 수 있을 거라고 생각함.

<details>
<summary><i>MongoDB Atlas 시간대 설정</i></summary>
<div markdown="1">

![트립텔러-타임존서울](https://github.com/user-attachments/assets/bac13394-1fa8-4f2d-832d-9e063371f0a4)

</details>

<details>
<summary><i>EC2 인스턴스의 리눅스 시간대 설정</i></summary>
<div markdown="1">

![트립텔러-리눅스타임존서울](https://github.com/user-attachments/assets/0ed08b5e-61f8-4081-9152-b69e13b5c77e)

</details>

<details>
<summary><i>PM2의 ecosystem.config.js 파일</i></summary>
<div markdown="1">

- 단일 인스턴스라서 클러스터 모드는 사용하지 않음.
- 클라우드 서버에서 이미 환경변수를 지정하였기 때문에 해당 파일 내 env 변수를 명시적으로 지정하지 않음.

  ```
  module.exports = {
    apps: [
      {
        name: 'main',  // 애플리케이션 이름 설정
        script: 'dist/main.js',  // 애플리케이션 실행 파일 경로
        instances: 1, // 인스턴스 개수 (단일 인스턴스)
        exec_mode: 'fork', // 실행 모드
        env: {
          TZ: 'Asia/Seoul',
        },
        env_production: {
          TZ: 'Asia/Seoul',
        },
      }
    ]
  };
  ```

</div>
</details>

<details>
<summary><i>UI에 시간 입력시 문제 없이 잘 렌더링됨</i></summary>
<div markdown="1">

![타임존변경후](https://github.com/user-attachments/assets/6d4b3752-e964-4720-b88a-2ed2fda9ad0e)

</details>

---

# 5. 배포 <br>

### 프론트엔드 배포

- <b>사전 세팅</b>

  - SSL 인증서로 CloudFront 설정

- <b>단계</b>

  1. master 브랜치에 푸시를 하면 Github Action이 실행됨.
  2. Github Action에서 빌드 후 AWS S3 버킷에 파일을 업로드함.

### 백엔드 배포

1. EC2 인스턴스 생성
2. HTTPS용 로드 밸런서(Elastic Load Balancer, ELB) 설정
3. EC2에 Node.js 및 PM2 설치
4. Github Action에 appleboy/ssh-action을 사용하여 EC2 접속
5. Github에서 소스코드를 가져옴.
6. npm i 후 NestJS 프로젝트를 빌드
7. pm2로 서버 코드 실행

---

# 6. 느낀점<br>

- ### 1. 기술 스택을 선택할 때 주변에서 권장하는 것을 비판적 사고 없이 수용하는 것을 지앙할 것.

  - 시간적 제약으로 인해 SQL 학습을 보류하고 MongoDB를 선택했지만, <b>`RDB와 비교한 MongoDB의 특성`</b>을 충분히 파악하지 않고 사용한 점이 아쉬움.
  - 앞으로는 <b>`해당 기술을 직접 사용해보고 장단점을 평가한 후, 프로젝트에 도입`</b>하도록 해야겠다고 생각함.

- ### 2. Join(populate)을 수행할 때 상위 모델의 id 값을 하위 모델의 필드에 일관되게 넣어야 하는 것의 중요성을 인식함.

  - 상위 모델의 ID 값을 하위 모델에 일관되게 넣는 것은 확장성을 보장함.
  - 본 프로젝트에서 검색 API를 구현할 때 일부 하위 모델에 상위 모델의 ID 값이 없어, <b>`여러 계층을 반복적으로 탐색해야 하는 비효율성`</b>이 발생하였음.

- ### 3. API 개발과 동시에 테스트 코드 작성의 중요성

  - API 개발과 함께 테스트 코드를 작성하면 <b>`다양한 실행 환경에서 일관된 결과`</b>를 보장할 수 있음.
  - 나중에 테스트 코드를 한꺼번에 작성하려니 어려움이 있었고, 수동 테스트 도구<i>(POSTMAN, Thunder Client)</i>에 의존할 필요 없이 자동화된 테스트가 가능해짐.

- ### 4. 관심사 분리로 모듈의 독립성 높이기
  - 프로젝트에서 FeedExtractor는 여러 모델에서 데이터를 모아 반환하는 함수로, 초기에는 데이터 불러오기만 했지만, 이후 필터링, 페이지네이션, 정렬 등의 기능이 추가됨.
  - 기능을 더 작은 단위로 나누고 추상화함으로써 <b>`코드 종속성을 줄였고, 예기치 않은 오류를 방지`</b>할 수 있었음.
