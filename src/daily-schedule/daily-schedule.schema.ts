import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyScheduleDocument = DailySchedule & Document;

@Schema({ timestamps: true, collection: 'DailySchedule' })
export class DailySchedule {
  // 시간 (ex. 오전 2시)
  @Prop({ type: Date })
  time: Date;

  // 장소
  @Prop()
  location: string;

  // 메모
  @Prop({ maxlength: 30 })
  memo: string;

  // 내용 (긴 글) (여행로그)
  @Prop({ default: null, maxlength: 100 })
  postContent: string;

  // 이미지 (여행로그)
  @Prop({ default: null })
  imageUrl: string;

  // 여행로그의 이미지 썸네일 여부
  @Prop({ default: false })
  isThumbnail: boolean;

  // 삭제일
  @Prop({ default: null })
  deletedAt: Date | null;
}

export const DailyScheduleSchema = SchemaFactory.createForClass(DailySchedule);
