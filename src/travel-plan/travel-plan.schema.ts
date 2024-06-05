import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { DailyPlan } from 'src/daily-plan/daily-plan.schema';
import { DailySchedule } from 'src/daily-schedule/daily-schedule.schema';
import { RegionName } from './region-name.enum';

export type TravelPlanDocument = TravelPlan & Document;

@Schema({ timestamps: true, collection: 'TravelPlan', toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class TravelPlan {
  // 일별 일정 관리 (참조)
  @Prop({ type: [{ type: Types.ObjectId, ref: DailySchedule.name }] })
  dailySchedules: DailySchedule[];

  // 일별 지출 (참조)
  @Prop({ type: [{ type: Types.ObjectId, ref: DailyPlan.name }] })
  dailyPlans: DailyPlan[];

  // 지역
  @Prop({ required: true, enum: Object.values(RegionName) })
  region: RegionName;

  // 글 제목
  @Prop({ required: true, maxlength: 20 })
  title: string;

  declare readonly startDate: Date;
  declare readonly endDate: Date;

  // 인원
  @Prop({
    required: true,
    min: 1,
    max: 10,
  })
  numberOfPeople: number;

  // 총지출
  @Prop({
    required: true,
    default: 0,
    min: 0,
  })
  totalExpense: number;

  // 삭제일
  @Prop({ default: null })
  deletedAt: Date | null;
}

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

// 'dailyPlans' 필드를 populate하는 미들웨어 함수
const populateDailyPlans = function (next) {
  this.populate({
    path: 'dailyPlans',
    model: 'DailyPlan',
  });
  next();
};

// 'find' 및 'findOne' 훅에 'populateDailyPlans' 함수 등록
TravelPlanSchema.pre('find', populateDailyPlans);
TravelPlanSchema.pre('findOne', populateDailyPlans);

export { TravelPlanSchema };
