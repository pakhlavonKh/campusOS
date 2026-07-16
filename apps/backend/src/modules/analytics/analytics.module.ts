import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradebookEntry } from '../gradebook/entities/gradebook.entity';
import { AttendanceRecord } from '../attendance/entities/attendance.entity';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GradebookEntry, AttendanceRecord])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
