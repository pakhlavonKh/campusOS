import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * Attendance Record — immutable per SRS §5.12 and SDD §3.2.11.
 * Corrections are done through separate correction records.
 */
@Entity('attendance_records')
@Index(['studentId', 'classId', 'date'])
export class AttendanceRecord extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'class_id', type: 'uuid', nullable: true })
  classId: string | null;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lessonId: string | null;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 20 })
  status: 'present' | 'absent' | 'late' | 'excused';

  @Column({ name: 'recorded_by', type: 'uuid' })
  recordedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}

/**
 * Attendance Correction — audited change to an attendance record.
 * SDD §3.2.11.
 */
@Entity('attendance_corrections')
export class AttendanceCorrection extends BaseEntity {
  @Column({ name: 'record_id', type: 'uuid' })
  recordId: string;

  @Column({ name: 'old_status', type: 'varchar', length: 20 })
  oldStatus: string;

  @Column({ name: 'new_status', type: 'varchar', length: 20 })
  newStatus: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'corrected_by', type: 'uuid' })
  correctedBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;
}
