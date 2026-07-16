import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEndpoint, WebhookDelivery } from './entities/webhook.entity';
import { WebhookService } from './services/webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEndpoint, WebhookDelivery])],
  providers: [WebhookService],
  exports: [WebhookService, TypeOrmModule],
})
export class WebhooksModule {}
