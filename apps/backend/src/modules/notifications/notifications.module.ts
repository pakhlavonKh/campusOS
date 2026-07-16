import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplate, NotificationRecord } from './entities/notification.entity';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplate, NotificationRecord])],
  controllers: [],
  providers: [NotificationsService],
  exports: [NotificationsService, TypeOrmModule],
})
export class NotificationsModule {}
