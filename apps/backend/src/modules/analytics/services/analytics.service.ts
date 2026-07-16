import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradebookEntry } from '../gradebook/entities/gradebook.entity';
import { AttendanceRecord } from '../attendance/entities/attendance.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(GradebookEntry) private readonly gradeRepo: Repository<GradebookEntry>,
    @InjectRepository(AttendanceRecord) private readonly attendanceRepo: Repository<AttendanceRecord>,
  ) {}

  async getCourseAverages(organizationId: string) {
    // A query to get average grades per course
    const result = await this.gradeRepo.createQueryBuilder('grade')
      .select('grade.courseId', 'courseId')
      .addSelect('AVG(grade.score / grade.maxScore * 100)', 'averageGrade')
      .where('grade.organizationId = :orgId', { orgId: organizationId })
      .andWhere('grade.score IS NOT NULL')
      .groupBy('grade.courseId')
      .getRawMany();
    
    return result;
  }

  async getAttendanceRates(organizationId: string) {
    const result = await this.attendanceRepo.createQueryBuilder('attendance')
      .select('attendance.courseId', 'courseId')
      .addSelect('COUNT(CASE WHEN attendance.status IN (\'present\', \'late\') THEN 1 END) * 100.0 / COUNT(*)', 'attendanceRate')
      .where('attendance.organizationId = :orgId', { orgId: organizationId })
      .groupBy('attendance.courseId')
      .getRawMany();

    return result;
  }

  async getAttendanceTrends(organizationId: string, days: number = 30) {
    // Generate trend data by grouping by date
    const result = await this.attendanceRepo.createQueryBuilder('attendance')
      .select('DATE(attendance.date)', 'date')
      .addSelect('COUNT(CASE WHEN attendance.status IN (\'present\', \'late\') THEN 1 END) * 100.0 / COUNT(*)', 'attendanceRate')
      .where('attendance.organizationId = :orgId', { orgId: organizationId })
      .andWhere('attendance.date >= CURRENT_DATE - INTERVAL \':days days\'', { days })
      .groupBy('DATE(attendance.date)')
      .orderBy('DATE(attendance.date)', 'ASC')
      .getRawMany();

    return result;
  }
}
