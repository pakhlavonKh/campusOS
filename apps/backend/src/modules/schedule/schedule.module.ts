import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntry, RecurringRule, CalendarSync, Booking } from './entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleEntry, RecurringRule, CalendarSync, Booking])],
  exports: [TypeOrmModule],
})
export class ScheduleModule {}
