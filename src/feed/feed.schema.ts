import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TravelPlan } from 'src/travelPlan/travelPlan.schema';

export type FeedDocument = Feed & Document;

@Schema({ timestamps: true, collection: 'Feed' })
export default class Feed {
  // 글쓴이(회원) ID
  @Prop({ required: true })
  userId: string;

  // 여행 계획 ID
  @Prop({ type: Types.ObjectId, ref: TravelPlan.name, default: null })
  travelPlan: TravelPlan | null;

  // 커버 이미지 url
  // 게시물 1개 당 커버 이미지 1개를 사용할 수 있도록 함.
  @Prop({ default: null })
  coverImage: string;

  // 삭제일
  @Prop({ default: null })
  deletedAt: Date | null;

  // 공개여부
  @Prop({ default: false })
  isPublic: boolean;

  // 비공개 전환 날짜
  @Prop({ default: null })
  requestPrivateAt: Date | null;

  // 좋아요 수
  @Prop({ default: 0, min: 0 })
  likeCount: number;

  // 게시물 작성일
  // mongoose의 sort 함수를 사용하기 위함.
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

// Feed 스키마에 대한 Mongoose 모델 생성
const FeedSchema = SchemaFactory.createForClass(Feed);

const populate = function (next) {
  this.populate({
    path: 'travelPlan',
    model: 'TravelPlan',
  });
  next();
};

FeedSchema.pre('find', populate);
FeedSchema.pre('findOne', populate);

export { FeedSchema };
