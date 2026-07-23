import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradebookEntry } from '../../gradebook/entities/gradebook.entity';
import { AttendanceRecord } from '../../attendance/entities/attendance.entity';
import { CourseEnrollment } from '../../lms/entities/lms.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(GradebookEntry) private readonly gradeRepo: Repository<GradebookEntry>,
    @InjectRepository(AttendanceRecord) private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(CourseEnrollment) private readonly enrollmentRepo: Repository<CourseEnrollment>,
  ) {}

  private isStudentOnly(user?: { sub?: string; roles?: string[] }): boolean {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    const adminOrTeacherRoles = ['admin', 'super_admin', 'org_admin', 'branch_admin', 'teacher', 'instructor'];
    const hasAdminOrTeacher = user.roles.some((r) => adminOrTeacherRoles.includes(r.toLowerCase()));
    const isStudent = user.roles.some((r) => r.toLowerCase() === 'student');
    return isStudent && !hasAdminOrTeacher;
  }

  private async getStudentEnrolledCourseIds(userId: string): Promise<string[]> {
    const enrollments = await this.enrollmentRepo.find({
      where: { userId },
      select: ['courseId'],
    });
    return enrollments.map((e) => e.courseId);
  }

  async getCourseAverages(organizationId: string, user?: { sub?: string; roles?: string[] }) {
    let enrolledCourseIds: string[] | null = null;
    if (this.isStudentOnly(user) && user?.sub) {
      enrolledCourseIds = await this.getStudentEnrolledCourseIds(user.sub);
      if (enrolledCourseIds.length === 0) {
        return [];
      }
    }

    const qb = this.gradeRepo.createQueryBuilder('grade')
      .select('grade.courseId', 'courseId')
      .addSelect('AVG(grade.score / grade.maxScore * 100)', 'averageGrade')
      .where('grade.organizationId = :orgId', { orgId: organizationId })
      .andWhere('grade.score IS NOT NULL');

    if (enrolledCourseIds && enrolledCourseIds.length > 0) {
      qb.andWhere('grade.courseId IN (:...enrolledCourseIds)', { enrolledCourseIds });
    }

    const result = await qb.groupBy('grade.courseId').getRawMany();
    return result;
  }

  async getAttendanceRates(organizationId: string, user?: { sub?: string; roles?: string[] }) {
    let enrolledCourseIds: string[] | null = null;
    if (this.isStudentOnly(user) && user?.sub) {
      enrolledCourseIds = await this.getStudentEnrolledCourseIds(user.sub);
      if (enrolledCourseIds.length === 0) {
        return [];
      }
    }

    const qb = this.attendanceRepo.createQueryBuilder('attendance')
      .select('attendance.courseId', 'courseId')
      .addSelect('COUNT(CASE WHEN attendance.status IN (\'present\', \'late\') THEN 1 END) * 100.0 / COUNT(*)', 'attendanceRate')
      .where('attendance.organizationId = :orgId', { orgId: organizationId });

    if (enrolledCourseIds && enrolledCourseIds.length > 0) {
      qb.andWhere('attendance.courseId IN (:...enrolledCourseIds)', { enrolledCourseIds });
    }

    const result = await qb.groupBy('attendance.courseId').getRawMany();
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
