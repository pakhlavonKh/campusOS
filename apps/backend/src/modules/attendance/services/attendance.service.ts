import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AttendanceRecord, AttendanceCorrection } from '../entities/attendance.entity';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly recordRepo: Repository<AttendanceRecord>,
    @InjectRepository(AttendanceCorrection)
    private readonly correctionRepo: Repository<AttendanceCorrection>,
  ) {}

  /**
   * Record or update daily attendance for a student
   */
  async recordAttendance(
    organizationId: string,
    data: {
      studentId: string;
      classId?: string;
      lessonId?: string;
      date: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      recordedBy: string;
      notes?: string;
    },
  ): Promise<AttendanceRecord> {
    // Check if record already exists for the same student, class/lesson, and date
    let record = await this.recordRepo.findOne({
      where: {
        organizationId,
        studentId: data.studentId,
        classId: (data.classId || null) as any,
        date: data.date,
      },
    });

    if (record) {
      record.status = data.status;
      record.recordedBy = data.recordedBy;
      record.notes = data.notes || null;
    } else {
      record = this.recordRepo.create({
        organizationId,
        studentId: data.studentId,
        classId: data.classId || null,
        lessonId: data.lessonId || null,
        date: data.date,
        status: data.status,
        recordedBy: data.recordedBy,
        notes: data.notes || null,
      });
    }

    return this.recordRepo.save(record);
  }

  /**
   * Fetch attendance history for a specific student
   */
  async getStudentAttendance(
    organizationId: string,
    studentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceRecord[]> {
    const where: any = { organizationId, studentId };
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }
    return this.recordRepo.find({ where, order: { date: 'DESC' } });
  }

  /**
   * Get attendance for a class on a specific date
   */
  async getClassAttendance(
    organizationId: string,
    classId: string,
    date: string,
  ): Promise<AttendanceRecord[]> {
    return this.recordRepo.find({
      where: { organizationId, classId, date },
    });
  }

  /**
   * Submit an attendance correction request
   */
  async requestCorrection(
    organizationId: string,
    data: {
      recordId: string;
      newStatus: 'present' | 'absent' | 'late' | 'excused';
      reason: string;
      correctedBy: string;
    },
  ): Promise<AttendanceCorrection> {
    const record = await this.recordRepo.findOne({
      where: { id: data.recordId, organizationId },
    });
    if (!record) {
      throw new NotFoundException(`Attendance record '${data.recordId}' not found.`);
    }

    const correction = this.correctionRepo.create({
      organizationId,
      recordId: data.recordId,
      oldStatus: record.status,
      newStatus: data.newStatus,
      reason: data.reason,
      correctedBy: data.correctedBy,
    });

    return this.correctionRepo.save(correction);
  }

  /**
   * Approve an attendance correction request and update the primary record
   */
  async approveCorrection(
    organizationId: string,
    correctionId: string,
    approvedBy: string,
  ): Promise<AttendanceRecord> {
    const correction = await this.correctionRepo.findOne({
      where: { id: correctionId, organizationId },
    });
    if (!correction) {
      throw new NotFoundException(`Correction request '${correctionId}' not found.`);
    }
    if (correction.approvedBy) {
      throw new BadRequestException('Correction request has already been approved.');
    }

    const record = await this.recordRepo.findOne({
      where: { id: correction.recordId, organizationId },
    });
    if (!record) {
      throw new NotFoundException(`Linked attendance record '${correction.recordId}' not found.`);
    }

    // Apply correction
    record.status = correction.newStatus as any;
    await this.recordRepo.save(record);

    // Finalize correction approval
    correction.approvedBy = approvedBy;
    await this.correctionRepo.save(correction);

    return record;
  }

  /**
   * Calculate summary statistics for an organization (or student)
   */
  async getDailyStats(
    organizationId: string,
    date: string,
    user?: any,
  ): Promise<{ present: number; absent: number; late: number; excused: number; rate: number }> {
    const roles: string[] = user?.roles || [];
    const adminOrTeacherRoles = ['admin', 'super_admin', 'org_admin', 'branch_admin', 'teacher', 'instructor'];
    const isStudentOnly = roles.some((r) => r.toLowerCase() === 'student') && !roles.some((r) => adminOrTeacherRoles.includes(r.toLowerCase()));

    const whereClause: any = { organizationId, date };
    if (isStudentOnly && user?.sub) {
      whereClause.studentId = user.sub;
    }

    const records = await this.recordRepo.find({
      where: whereClause,
    });

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    records.forEach((r) => {
      if (r.status === 'present') stats.present++;
      else if (r.status === 'absent') stats.absent++;
      else if (r.status === 'late') stats.late++;
      else if (r.status === 'excused') stats.excused++;
    });

    const total = records.length;
    const presentOrLate = stats.present + stats.late;
    const rate = total > 0 ? (presentOrLate / total) * 100 : 100;

    return {
      ...stats,
      rate: Math.round(rate * 10) / 10,
    };
  }
}
