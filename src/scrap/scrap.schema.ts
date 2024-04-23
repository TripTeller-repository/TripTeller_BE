import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScrapDocument = Scrap & Document;

@Schema({ timestamps: true, collection: 'Scrap' })
export default class Scrap {
  // 회원 ID
  @Prop({ required: true })
  userId: string;

  // 게시물 ID
  @Prop({ required: true })
  feedId: string;

  // 삭제일
  @Prop({ default: null })
  deletedAt: Date | null;
}

// Scrap 스키마에 대한 Mongoose 모델 생성
export const ScrapSchema = SchemaFactory.createForClass(Scrap);
