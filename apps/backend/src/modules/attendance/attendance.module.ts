import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord, AttendanceCorrection } from './entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord, AttendanceCorrection])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class AttendanceModule {}
