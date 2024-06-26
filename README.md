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

- [프로젝트 개요](#프로젝트-개요)<br>
- [프로젝트 아키텍쳐](#프로젝트-아키텍쳐)<br>
- [구현 내용](#구현-내용)<br>
- [이슈 해결](#이슈-해결)<br>
- [배포전략](#배포전략)<br>
- [프로젝트 성찰](#프로젝트-성찰)<br>

---

## 🔷 프로젝트 개요<br>

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
| <b>NestJS</b>  | • NestJS는 Express의 높은 자유도에 비해 <u>설계 부담을 크게 줄이는 구조화된 모듈식 아키텍처</u> 때문에 채택함. <br> • 또한 종속성 주입, 직관적인 CLI, TypeScript 지원 등 다양한 기능이 있어서 개발자의 편의를 돕는 다양한 기능을 제공함.                                                                                                                                                            |
| <b>MongoDB</b> | • MongoDB의 유연한 스키마 구조는 대규모 데이터를 분산처리하는 데 이상적이지만 본 프로젝트에서는 대용량 데이터를 특별히 다루고 있지는 않음.<br>• 그러나 스키마 변경이 되어도 큰 문제가 발생하지 않는 <u>유연한 데이터 모델링이 가능</u>한 mongoDB의 특성을 활용함.<br> • 이 결정은 프로젝트의 상호 연결된 CRUD 작업으로 인해 설계 단계에서 스키마 조정이 필요할 수 있다는 점을 염두하여 내려진 것임. |
| <b>JWT</b>     | • stateless(상태 비저장) 인증인 JWT는 서버 로드를 줄이고 인증 프로세스 속도를 높임.                                                                                                                                                                                                                                                                                                                 |
| <b>AWS</b>     | • AWS에서 웹 애플리케이션 호스팅 및 배포의 거의 모든 측면을 포괄하는 <u>광범위한 서비스</u>를 제공하며, <u>대량의 트래픽 처리</u>를 쉽게 할 수 있도록 설계되어 활용함.                                                                                                                                                                                                                              |

<br>

- ### 개발환경 <br>

  - Node.js : v20.9.0<br>
  - Mongoose : ^8.3.1<br>
  - @nestjs/cli : ^10.0.0<br>
  - @nestjs/common : ^10.3.8<br>
    <br>

- ### 관련 링크 <br>
  - Swagger : https://tripteller-apidoc.s3.ap-northeast-2.amazonaws.com/swagger-index.html
  - POSTMAN : https://www.postman.com/tripteller/workspace/tripteller-prod/folder/32621611-481f263e-7597-4405-9cd9-9d0dfb22d124?action=share&creator=32621611&ctx=documentation

---

## 🔷 프로젝트 아키텍쳐<br>

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

Tool : GitMind
<br>
<br>

### 카카오 로그인 시퀀스 다이어그램

<br>

## 🔷 구현 내용<br>

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
| 액세스 토큰 | 값 | HTTP 헤더 | 1 시간 |
| 리프레시 토큰 | 쿠키 | HTTP 헤더<br>(HttpOnly 옵션 사용) | 5 분 |

<b>절차</b>

1. 로그인이 성공하면 서버에서는 액세스토큰과 쿠키 안에 리프레시토큰을 발급해줌.
2. <u>액세스토큰이 만료</u>되면 서버에서 클라이언트로 "Access Token has expired." 오류 메시지를 보냄.
3. 클라이언트에서는 액세스토큰 재발급 요청을 보냄.
4. 서버에서는 쿠키의 리프레시토큰 검증 후 액세스토큰을 재발급함.
5. 만약 <u>리프레시토큰이 만료된 경우</u> 서버에서 클라이언트로 "Refresh Token has expired." 오류 메시지를 보냄.
6. 클라이언트에서는 로그인페이지로 리다이렉트를 함.<br>

<b>효과</b>

- <b>짧은 액세스토큰</b> : 훔친 토큰을 오용할 수 있는 기회를 줄일 수 있음.
- <b>HttpOnly 쿠키</b> : 리프레시 토큰을 쿠키에 담아 클라이언트 측의 액세스를 방지하여 XSS 공격을 완화함.
- <b>토큰 순환</b> : 잦은 빈도의 액세스 토큰 갱신으로 시스템 보안이 유지됨.  
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
  - <b>Aggregation Pipeline</b> : MongoDB의 Aggregation Pipeline을 사용하여 트랜잭션 없이 일관된 데이터를 제공함.
  - <b>$facet 스테이지</b> : 단일 쿼리로 metadata와 data를 병렬로 처리하여 성능을 최적화함.
  - <b>비동기 처리</b> : async/await를 사용하여 비동기적으로 작업을 수행함으로써 Node.js의 이벤트 루프를 블록하지 않음.
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

## 🔷 이슈 해결<br>

### 1. 입력받는 여행 시작일과 종료일 데이터를 Mongoose 가상속성으로 변경

| 항목   | 내용                                                                                                                                                                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상황   | • 사용자가 입력한 여행 시작일(startDate)과 종료일(endDate)를 travelPlan 스키마의 필드에 직접 넣어서 저장함. <br> • 이 데이터를 클라이언트 측에서 받아서 매번 UI를 동적으로 생성하였음.                                                                                                        |
| 문제   | • 해당 날짜가 자주 변경되거나 여러 문서에 동일한 데이터가 여러 개 표시되는 경우 데이터 중복이 발생할 수 있고, 입출력이 늘어남.<br> • 클라이언트 측에서는 사용자가 입력한 날짜를 수정할 때마다 직접 통신을 통해 변경된 데이터를 서버에서 받아와야 하므로, 비효율적으로 API 호출을 자주하게 됨. |
| 해결   | • travelPlan 스키마의 startDate 및 endDate 필드를 가상 속성으로 활용함. 이러한 속성을 동적으로 계산함으로써 수동으로 날짜를 계산하고 입력할 필요가 없어짐.<br> • 이후 DailyPlan 스키마를 생성하여 날짜에 따른 하위 데이터의 입력이 수월하게 이루어짐.                                         |
| 느낀점 | • 가상 스키마를 사용하면 유연하고 동적인 필드를 생성할 수 있음.<br>• 하지만 가상 속성을 사용할 때는 성능 및 데이터 무결성 문제를 고려해야 함.<br>ex) 기간별 조회 API 개발 시, startDate와 endDate를 직접 접근하지 못하여 쿼리문이 인식되지 않은 문제가 있었음.                                |

<br>

### 2. 동시성 문제를 고려하여 페이지네이션 쿼리를 수정

| 항목   | 내용                                                                                                                                                                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상황   | • skip 및 limit 메소드를 사용하여 페이지별로 게시물 조회하도록 함.                                                                                                                                                                                                                                        |
| 문제   | • 기존 코드는 두 개의 독립적인 요청을 보내는 구조로, 이로 인해 동시성 문제가 발생할 수 있음.<br> • 즉, 한 요청이 보내진 후에 그 사이에 데이터베이스 내용이 변경된다면, 해당 변경 사항이 반영되지 않음.<br> → 데이터 일관성에 영향을 줄 수 있음.<br> (실제로 데이터가 일관되게 로드되지 않는 것을 확인함.) |
| 해결   | • travelPlan 스키마의 startDate 및 endDate 필드를 가상 속성으로 활용함. 이러한 속성을 동적으로 계산함으로써 수동으로 날짜를 계산하고 입력할 필요가 없어짐.<br> • 이후 DailyPlan 스키마를 생성하여 날짜에 따른 하위 데이터의 입력이 수월하게 이루어짐.                                                     |
| 느낀점 | • 가상 스키마를 사용하면 유연하고 동적인 필드를 생성할 수 있음.<br>• 하지만 가상 속성을 사용할 때는 성능 및 데이터 무결성 문제를 고려해야 함.<br>ex) 기간별 조회 API 개발 시, startDate와 endDate를 직접 접근하지 못하여 쿼리문이 인식되지 않은 문제가 있었음.                                            |

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

---

## 🔷 배포 전략<br>

### 프론트엔드 배포

1. AWS S3에서 파일 빌드 및 저장
2. SSL 인증서로 CloudFront 설정
3. Github Action을 사용하여 자동배포 스크립트 실행

### 백엔드 배포

1. EC2 인스턴스 생성
2. HTTPS용 로드 밸런서(Elastic Load Balancer, ELB) 설정
3. EC2에 Node.js 및 PM2 설치
4. PM2를 프로젝트 저장소와 연결
5. 환경변수 파일을 FTP 소프트웨어를 통해 추가함.
6. 실행을 위해 TypeScript 파일을 JavaScript(dist 폴더)로 컴파일함.
7. HTTPS(https://api.trip-teller.com)를 통해 백엔드와 통신하도록 프론트엔드를 설정
8. Github Action을 사용하여 자동배포 스크립트 실행

---

## 🔷 프로젝트 성찰<br>

- ### 1. 기술 스택을 선택할 때 주변에서 권장하는 것을 비판적 사고 없이 수용하는 것을 지앙할 것.

  - 시간적 제약으로 인해 SQL를 추가적으로 학습하는 것을 보류하여 MongoDB를 선택하였음. JSON과 유사한 데이터 구조와 친숙한 Mongoose 구문 덕분에 코드 작성은 수월하였으나, 사전에 RDB와 비교했을 때의 MongoDB의 특성을 충분히 파악하지 않고 활용한 것이 아쉬움.
  - <u>해당 기술을 직접 사용해보고 장단점을 평가한 후, 프로젝트에 도입하도록 해야겠다</u>고 생각함.

- ### 2. 사전 기획과 관계없이 Join(populate)을 수행할 때 상위 모델의 id 값을 하위 모델의 필드에 일관되게 넣어야 하는 것의 중요성을 인식함.

  - 이는 추가 로직 구현 시 확장성을 보장함. 프로젝트 요구 사항이 고도화되면서 다양한 로직을 원활하게 통합할 수 있는 기반이 됨.
  - 본 프로젝트에서 검색 API를 구현할 때 연결된 하위모델의 필드에 상위모델의 ID값이 없는 경우가 일부 있었음. <u>그 결과 여러 계층을 반복적으로 탐색해야 했기 때문에 비효율성이 발생함</u>.

- ### 3. API를 만들고 이에 대응하는 테스트 코드를 동시에 작성하는 것의 필요성을 인식함.

  - <u>다양한 실행 환경에서의 일관된 결과를 보장하려면 API 개발과 함께 테스트 코드를 작성해야 함</u>. 나중에 한꺼번에 테스트코드를 작성하려고 하니 어려움을 겪었음.
  - 이렇게 되면 Postman 또는 Thunder Client와 같은 도구를 통해 수동으로 입력하고 확인하는 방법에 의존할 필요가 없음.

- ### 4. 명확한 관심사 분리를 통해 모듈의 독립성을 높이는 것의 중요성을 인식함.
  - 해당 프로젝트에서 FeedExtractor로 화면에 렌더링할 데이터를 각각 다른 계층의 모델에서 모아서 반환하는 함수가 있음.
  - 초기에는 데이터 불러오기만 진행하였으나, 추후 필터링, 페이지네이션, 정렬 기준 등이 추가되면서 <u>추상화의 중요성을 인식하고 기능을 더 작은 단위로 나누어 코드 종속성을 줄임</u>.
  - 이 접근 방식은 각기 다른 기능을 한꺼번에 작성할 때 발생하는 예기치 않은 오류를 방지하는 데 도움이 됨.
