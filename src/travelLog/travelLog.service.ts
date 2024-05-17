import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailySchedule } from 'src/dailySchedule/dailySchedule.schema';
import { createFileUnixName, createSignedUrl } from 'src/utils/file.util';
import { PutTravelLogPostContentDto } from './dto/putTravelLogPostContent.dto';
import { PutTravelLogImageDto } from './dto/putTravelLogImage.dto';

@Injectable()
export class TravelLogService {
  constructor(@InjectModel('DailySchedule') private readonly dailyScheduleModel: Model<DailySchedule>) {}

  // 여행 로그 조회
  async findOneTravelLog(dailyScheduleId: string) {
    const findTravelLog = await this.dailyScheduleModel.findOne({ _id: dailyScheduleId }).exec();
    if (!findTravelLog) {
      throw new NotFoundException('해당 여행 로그를 조회할 수 없습니다.');
    }
    return findTravelLog;
  }

  // 여행 로그 글 작성
  async updateTravelLogPostContent(dailyScheduleId: string, putTravelLogPostContentDto: PutTravelLogPostContentDto) {
    const findDailySchedule = await this.dailyScheduleModel.findOne({ _id: dailyScheduleId });

    findDailySchedule.postContent = putTravelLogPostContentDto.postContent;

    await findDailySchedule.save();

    if (!findDailySchedule.postContent) {
      throw new NotFoundException('글 등록 중 에러가 발생하였습니다.');
    }

    if (findDailySchedule.postContent.length > 100) {
      throw new NotFoundException('글 길이가 100자가 초과하였습니다.');
    }

    return { postContent: findDailySchedule.postContent };
  }

  // 여행 로그 이미지 등록
  async updateTravelLogImage(dailyScheduleId: string, putTravelLogImageDto: PutTravelLogImageDto) {
    const findDailySchedule = await this.dailyScheduleModel.findOne({ _id: dailyScheduleId });

    findDailySchedule.imageUrl = putTravelLogImageDto.imageUrl;

    await findDailySchedule.save();

    if (!findDailySchedule.imageUrl) {
      throw new NotFoundException('이미지 등록 중 에러가 발생하였습니다.');
    }

    return findDailySchedule.imageUrl;
  }

  // 여행 로그 삭제
  async deleteTravelLog(dailyScheduleId: string) {
    const findDailySchedule = await this.dailyScheduleModel.findOne({ _id: dailyScheduleId });

    findDailySchedule.postContent = null;
    findDailySchedule.imageUrl = null;

    await findDailySchedule.save();

    if (!findDailySchedule.postContent === null || !findDailySchedule.imageUrl === null) {
      throw new NotFoundException('해당 여행 로그를 찾을 수 없습니다.');
    }
    return { message: '여행 로그가 삭제되었습니다.' };
  }

  // AWS S3 TravelLog 이미지 Signed URL 불러오기
  async findTravelLogImageSignedUrl(fileName: string, userId: string) {
    const fileNameInBucket = createFileUnixName(fileName, userId);
    const filePathName = `travel-log-image/${fileNameInBucket}`;
    return await createSignedUrl(filePathName);
  }
}
