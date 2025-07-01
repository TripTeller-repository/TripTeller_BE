import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@common/guards/auth.guard';
import { FeedScrapService } from '@common/services/feed-scrap.service';
import { FeedSchema } from '@feed/feed.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapSchema } from '@scrap/scrap.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Feed', schema: FeedSchema },
      { name: 'Scrap', schema: ScrapSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthGuard, FeedScrapService],
  exports: [JwtModule, JwtAuthGuard, FeedScrapService],
})
export class CommonModule {}
