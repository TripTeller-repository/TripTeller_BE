import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDailyScheduleDto } from './dto/createdailySchedule.dto';
import { PutDailyScheduleDto } from './dto/putdailySchedule.dto';
import { Model, Types } from 'mongoose';
import { DailySchedule } from './dailySchedule.schema';
import { TravelPlan } from 'src/travelPlan/travelPlan.schema';
import { DailyPlan } from 'src/dailyPlan/dailyPlan.schema';

@Injectable()
export class DailyScheduleService {
  constructor(
    @InjectModel('DailySchedule') private readonly dailyScheduleModel: Model<DailySchedule>,
    @InjectModel('DailyPlan') private readonly dailyPlanModel: Model<DailyPlan>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
  ) {}

  // 개별 일정 조회
  async findDailyScheduleOne(dailyScheduleId: string) {
    const findDailySchedule = await this.dailyScheduleModel.findOne({ _id: dailyScheduleId }).exec();
    if (!findDailySchedule) {
      throw new NotFoundException('해당 일정을 조회할 수 없습니다.');
    }
    return findDailySchedule;
  }

  // 개별 일정 생성
  async createDailySchedule(createDailyScheduleDto: CreateDailyScheduleDto, dailyPlanId: string) {
    const createDailySchedule = await this.dailyScheduleModel.create(createDailyScheduleDto);

    const plan = await this.dailyPlanModel
      .findByIdAndUpdate(
        { _id: dailyPlanId },
        { $push: { dailySchedules: createDailySchedule._id } },
        {
          runValidators: true,
          new: true,
        },
      )
      .exec();

    if (!plan) {
      throw new NotFoundException('해당 일정을 생성할 수 없습니다.');
    }
    return createDailySchedule;
  }

  // 개별 일정 수정
  async updateDailySchedule(dailyScheduleId: string, putDailyScheduleDto: PutDailyScheduleDto) {
    const putDailySchedule = await this.dailyScheduleModel
      .findOneAndUpdate({ _id: dailyScheduleId }, putDailyScheduleDto, { runValidators: true, new: true })
      .exec();
    if (!putDailySchedule) {
      throw new NotFoundException('해당 일정을 수정할 수 없습니다.');
    }
    return putDailySchedule;
  }

  // 일정 삭제
  async deleteDailySchedule(travelPlanId: string, dailyScheduleId: string) {
    // travelPlan 모델의 dailyScheduleId 필드(배열)에서 dailyScheduleId id값 삭제
    const objectIdDailyScheduleId = new Types.ObjectId(dailyScheduleId);

    await this.travelPlanModel
      .updateOne(
        { _id: travelPlanId },
        { $pull: { dailySchedules: objectIdDailyScheduleId } },
        { runValidators: true, new: true },
      )
      .exec();
    // dailySchedule 모델에서 해당 dailyScheduleId값을 가진 도큐먼트 삭제
    const deletedDailySchedule = await this.dailyScheduleModel.findByIdAndDelete({ _id: dailyScheduleId });
    if (!deletedDailySchedule) {
      throw new NotFoundException('해당 스케쥴이 존재하지 않습니다.');
    }
    return { message: '일정이 삭제되었습니다.' };
  }
}
