import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDailyScheduleDto } from './dto/create-daily-schedule.dto';
import { PutDailyScheduleDto } from './dto/put-daily-schedule.dto';
import { Model, Types } from 'mongoose';
import { DailySchedule } from './daily-schedule.schema';
import { DailyPlan } from '@daily-plan/daily-plan.schema';
import { TravelPlan } from '@travel-plan/travel-plan.schema';

@Injectable()
export class DailyScheduleService {
  constructor(
    @InjectModel('DailySchedule') private readonly dailyScheduleModel: Model<DailySchedule>,
    @InjectModel('DailyPlan') private readonly dailyPlanModel: Model<DailyPlan>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
  ) {}

  /**
   * 특정 ID를 가진 개별 일정을 조회
   *
   * @param {string} dailyScheduleId - 조회할 일정 ID
   * @throws {NotFoundException} 일정이 존재하지 않을 경우
   * @returns {Promise<DailySchedule>} 조회된 일정
   */
  async fetchOneDailySchedule(dailyScheduleId: string) {
    const findDailySchedule = await this.dailyScheduleModel.findOne({ _id: dailyScheduleId }).exec();
    if (!findDailySchedule) {
      throw new NotFoundException('해당 일정을 조회할 수 없습니다.');
    }
    return findDailySchedule;
  }

  /**
   * 새로운 개별 일정을 생성하고 해당 일별 계획(DailyPlan)에 연결
   *
   * @param {CreateDailyScheduleDto} createDailyScheduleDto - 생성할 일정 정보
   * @param {string} dailyPlanId - 연결할 일별 계획 ID
   * @throws {NotFoundException} 일별 계획이 존재하지 않을 경우
   * @returns {Promise<DailySchedule>} 생성된 일정
   */
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

  /**
   * 특정 개별 일정을 수정
   *
   * @param {string} dailyScheduleId - 수정할 일정 ID
   * @param {PutDailyScheduleDto} putDailyScheduleDto - 수정할 데이터
   * @throws {NotFoundException} 일정이 존재하지 않을 경우
   * @returns {Promise<DailySchedule>} 수정된 일정
   */
  async updateDailySchedule(dailyScheduleId: string, putDailyScheduleDto: PutDailyScheduleDto) {
    const putDailySchedule = await this.dailyScheduleModel
      .findOneAndUpdate({ _id: dailyScheduleId }, putDailyScheduleDto, { runValidators: true, new: true })
      .exec();
    if (!putDailySchedule) {
      throw new NotFoundException('해당 일정을 수정할 수 없습니다.');
    }
    return putDailySchedule;
  }

  /**
   * 특정 개별 일정을 삭제하고, TravelPlan의 참조 배열에서도 제거
   *
   * @param {string} travelPlanId - 여행 계획 ID
   * @param {string} dailyScheduleId - 삭제할 일정 ID
   * @throws {NotFoundException} 일정이 존재하지 않을 경우
   * @returns {Promise<{ message: string }>} 삭제 완료 메시지
   */
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
