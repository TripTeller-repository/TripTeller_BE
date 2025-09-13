import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FeedScrapService } from '@common/services/feed-scrap.service';
import { FeedSchema } from '@feed/feed.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ScrapSchema } from '@scrap/scrap.schema';
import { JwtAuthGuard } from '@auth/guards/auth.guard';

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
        secret: configService.get<string>('jwt.access.secretKey'),
        signOptions: { expiresIn: configService.get<string>('jwt.access.expiresIn') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthGuard, FeedScrapService],
  exports: [JwtModule, JwtAuthGuard, FeedScrapService],
})
export class CommonModule {}
