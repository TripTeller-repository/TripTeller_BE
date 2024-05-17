import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Feed from 'src/feed/feed.schema';
import { TravelPlan } from './travelPlan.schema';
import { DailyPlan, DateType } from 'src/dailyPlan/dailyPlan.schema';
import { CreateTravelPlanDto } from './dto/createTravelPlan.dto';
import { PutTravelPlanDto } from './dto/putTravelPlan.dto';
import dayjs from 'dayjs';
import { FeedExtractor } from 'src/utils/feedExtractor';

@Injectable()
export class TravelPlanService {
  constructor(
    private readonly feedExtractor: FeedExtractor,
    @InjectModel('Feed') private readonly feedModel: Model<Feed>,
    @InjectModel('TravelPlan') private readonly travelPlanModel: Model<TravelPlan>,
    @InjectModel('DailyPlan') private readonly dailyPlanModel: Model<DailyPlan>,
  ) {}

  // 특정 여행 일정 조회
  async findTravelPlan(feedId: string, travelPlanId: string, userId: string) {
    await this.feedExtractor.checkUser(feedId, userId);
    const plan = await this.travelPlanModel.findById({ _id: travelPlanId }).exec();

    if (!plan) {
      throw new NotFoundException('해당 여행 일정을 조회할 수 없습니다.');
    }

    return plan;
  }

  // 여행 일정 등록 (ID 업데이트)
  async createTravelPlan(feedId: string, createTravelPlanDto: CreateTravelPlanDto, userId: string) {
    await this.feedExtractor.checkUser(feedId, userId);
    const createdPlan = await this.travelPlanModel.create(createTravelPlanDto);
    const feed = await this.feedModel
      .findByIdAndUpdate(
        { _id: feedId },
        {
          travelPlan: createdPlan,
          userId,
        },
        {
          runValidators: true,
          new: true,
        },
      )
      .exec();
    if (!feed) {
      throw new NotFoundException('해당 여행 일정을 등록할 수 없습니다.');
    }

    // createdPlan => 방금 생성한 TravelPlan
    // TravelPlan에 기간에 따라 DailyPlan N개 생성하도록 함.
    let startdDate = dayjs(createTravelPlanDto.startDate);
    const endDate = dayjs(createTravelPlanDto.endDate);

    const dailyPlans = [
      await this.dailyPlanModel.create({
        dateType: DateType.STRING,
        dateString: '여행준비',
      }),
    ];

    while (endDate.toDate() >= startdDate.toDate()) {
      dailyPlans.push(
        await this.dailyPlanModel.create({
          date: startdDate.toDate(),
        }),
      );

      startdDate = startdDate.add(1, 'day');
    }

    createdPlan.dailyPlans = dailyPlans;

    await createdPlan.save();

    return createdPlan;
  }

  // 여행 일정 수정
  async updateTravelPlan(feedId: string, travelPlanId: string, putTravelPlanDto: PutTravelPlanDto, userId: string) {
    await this.feedExtractor.checkUser(feedId, userId);
    const updatePlan = await this.travelPlanModel.findByIdAndUpdate({ _id: travelPlanId }, putTravelPlanDto, {
      runValidators: true,
      new: true,
    });
    if (!updatePlan) {
      throw new NotFoundException('해당 여행 일정을 수정할 수 없습니다.');
    }
    return updatePlan;
  }

  // 여행 일정 삭제
  async deleteTravelPlan(feedId: string, travelPlanId: string) {
    // travelPlanModel의 deletedAt의 값을 date로 변경
    const deletedTravelPlan = await this.travelPlanModel
      .findByIdAndUpdate({ _id: travelPlanId }, { deletedAt: new Date() }, { runValidators: true, new: true })
      .exec();

    if (!deletedTravelPlan) {
      throw new NotFoundException('해당 여행 일정을 찾을 수 없습니다.');
    }
    return { message: '여행 일정이 삭제되었습니다.' };
  }
}
