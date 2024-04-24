import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TravelPlan } from 'src/travelPlan/travelPlan.schema';
import { DailyPlan } from './dailyPlan.schema';
import { CreateDailyPlanDto } from './dto/createDailyPlan.dto';
import { PutDailyPlanDto } from './dto/putDailyPlan.dto';

@Injectable()
export class DailyPlanService {
  constructor(
    @InjectModel('DailyPlan') private readonly dailyPlanModel: Model<DailyPlan>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
  ) {}

  // 일별 일정 조회
  async findOneDailyPlan(travelPlanId: string, dailyPlanId: string) {
    const findDailyPlan = await this.dailyPlanModel.findOne({ _id: dailyPlanId }).exec();
    if (!findDailyPlan) {
      throw new NotFoundException('해당 일정이 존재하지 않습니다.');
      throw new NotFoundException('해당 일정을 조회할 수 없습니다.');
    }
    return findDailyPlan;
  }

  // 일별 일정 생성
  async createDailyPlan(createDailyPlanDto: CreateDailyPlanDto, travelPlanId: string) {
    const createDailyPlan = await this.dailyPlanModel.create(createDailyPlanDto);
    const plan = await this.travelPlanModel
      .findByIdAndUpdate(
        { _id: travelPlanId },
        { $push: { dailyPlans: createDailyPlan._id } },
        {
          runValidators: true,
          new: true,
        },
      )
      .exec();
    if (!plan) {
      throw new NotFoundException('해당 일정을 생성할 수 없습니다.');
    }
    return createDailyPlan;
  }

  // 일별 일정 수정
  async updateDailyPlan(travelPlanId: string, dailyPlanId: string, putDailyPlanDto: PutDailyPlanDto) {
    const putDailyPlan = await this.dailyPlanModel
      .findOneAndUpdate({ _id: dailyPlanId }, putDailyPlanDto, { runValidators: true, new: true })
      .exec();
    if (!putDailyPlan) {
      throw new NotFoundException('해당 일정을 수정할 수 없습니다.');
    }
    return putDailyPlan;
  }

  // 일별 일정 삭제
  async deleteDailyPlan(travelPlanId: string, dailyPlanId: string) {
    // travelPlan 모델의 dailyScheduleId 필드(배열)에서 dailyPlanId id값 삭제
    const objectIdDailyPlanId = new Types.ObjectId(dailyPlanId);
    await this.travelPlanModel
      .updateOne(
        { _id: travelPlanId },
        { $pull: { dailyPlans: objectIdDailyPlanId } },
        { runValidators: true, new: true },
      )
      .exec();
    // dailySchedule 모델에서 해당 dailyPlanId값을 가진 도큐먼트 삭제
    const deletedDailyPlan = await this.dailyPlanModel.findByIdAndDelete({ _id: dailyPlanId });
    if (!deletedDailyPlan) {
      throw new NotFoundException('해당 날짜별 일정이 존재하지 않습니다.');
    }
    return { message: '날짜별 일정이 삭제되었습니다.' };
  }
}
