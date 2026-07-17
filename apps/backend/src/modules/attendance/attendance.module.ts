import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord, AttendanceCorrection } from './entities/attendance.entity';
import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './controllers/attendance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord, AttendanceCorrection])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [TypeOrmModule, AttendanceService],
})
export class AttendanceModule {}

