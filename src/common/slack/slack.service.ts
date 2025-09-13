import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

/**
 * Slack Webhook을 통해 메시지를 전송하는 서비스
 */
@Injectable()
export class SlackService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Slack으로 에러 메시지를 전송
   * @param message - 전송할 메시지
   */
  async sendError(message: string): Promise<void> {
    const webhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL');
    if (!webhookUrl) return;

    try {
      await axios.post(webhookUrl, { text: message });
    } catch (error) {
      console.error('Slack 전송 실패:', error.message);
    }
  }
}
