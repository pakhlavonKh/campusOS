import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * Announcement — Broadcast message to a course or cohort.
 * SDD §3.2.15 Collaboration Context.
 */
@Entity('announcements')
export class Announcement extends BaseEntity {
  @Column({ name: 'target_type', type: 'varchar', length: 20 })
  targetType: 'course' | 'cohort' | 'organization' | 'branch';

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;
}

/**
 * Forum — Discussion board.
 */
@Entity('forums')
export class Forum extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}

/**
 * Thread — A conversation topic within a forum.
 */
@Entity('threads')
export class Thread extends BaseEntity {
  @Column({ name: 'forum_id', type: 'uuid' })
  forumId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;
}

/**
 * Post — A reply to a thread.
 */
@Entity('posts')
export class Post extends BaseEntity {
  @Column({ name: 'thread_id', type: 'uuid' })
  threadId: string;

  @Column({ name: 'parent_post_id', type: 'uuid', nullable: true })
  parentPostId: string | null; // For nested replies

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_accepted_answer', type: 'boolean', default: false })
  isAcceptedAnswer: boolean;
}

/**
 * Reaction — emoji reaction on a post or announcement.
 * SRS §5.11.2 — emoji reactions (like, helpful, insightful, etc.).
 */
@Entity('reactions')
@Index(['targetType', 'targetId', 'userId'], { unique: true })
export class Reaction extends BaseEntity {
  @Column({ name: 'target_type', type: 'varchar', length: 30 })
  targetType: 'post' | 'announcement' | 'thread';

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  emoji: string; // e.g., 'like', 'helpful', 'insightful', 'confused'
}

/**
 * QAQuestion — question on a Q&A board for a course/class.
 * SRS §5.11.3 — supports upvoting, anonymous posting, and answered marking.
 */
@Entity('qa_questions')
@Index(['courseId', 'organizationId'])
export class QAQuestion extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId: string | null; // null = anonymous

  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'upvote_count', type: 'int', default: 0 })
  upvoteCount: number;

  @Column({ name: 'is_answered', type: 'boolean', default: false })
  isAnswered: boolean;

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean;
}

/**
 * QAAnswer — answer to a Q&A question.
 * SRS §5.11.3 — teacher can mark as accepted; answers are highlighted.
 */
@Entity('qa_answers')
@Index(['questionId'])
export class QAAnswer extends BaseEntity {
  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'is_accepted', type: 'boolean', default: false })
  isAccepted: boolean;

  @Column({ name: 'upvote_count', type: 'int', default: 0 })
  upvoteCount: number;
}

/**
 * OfficeHoursSlot — teacher-defined availability slot.
 * SRS §5.11.4 — teachers define available office hours.
 */
@Entity('office_hours_slots')
@Index(['teacherId', 'startTime'])
export class OfficeHoursSlot extends BaseEntity {
  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string | null;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ name: 'max_bookings', type: 'int', default: 1 })
  maxBookings: number;

  @Column({ name: 'is_virtual', type: 'boolean', default: false })
  isVirtual: boolean;

  @Column({ name: 'meeting_url', type: 'text', nullable: true })
  meetingUrl: string | null;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurrence_rule', type: 'varchar', length: 255, nullable: true })
  recurrenceRule: string | null;
}

/**
 * OfficeHoursBooking — student booking of an office hours slot.
 * SRS §5.11.4 — students book time slots; teacher sees a queue.
 */
@Entity('office_hours_bookings')
@Index(['slotId', 'studentId'], { unique: true })
export class OfficeHoursBooking extends BaseEntity {
  @Column({ name: 'slot_id', type: 'uuid' })
  slotId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ type: 'varchar', length: 20, default: 'confirmed' })
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';

  @Column({ name: 'student_notes', type: 'text', nullable: true })
  studentNotes: string | null;

  @Column({ name: 'teacher_notes', type: 'text', nullable: true })
  teacherNotes: string | null;
}

/**
 * ReadReceipt — tracks which users have read an announcement.
 * SRS §5.11.1 — "Track which students and parents have read announcements."
 */
@Entity('read_receipts')
@Index(['targetType', 'targetId', 'userId'], { unique: true })
export class ReadReceipt extends BaseEntity {
  @Column({ name: 'target_type', type: 'varchar', length: 30 })
  targetType: 'announcement' | 'thread';

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'read_at', type: 'timestamptz', default: () => 'NOW()' })
  readAt: Date;
}

