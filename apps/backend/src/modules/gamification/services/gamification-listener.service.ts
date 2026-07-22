import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

/**
 * GamificationListenerService
 *
 * Registers event listeners for all domain events that trigger XP, badges, and streaks.
 * Called by EventEmitter2 when events are published by other modules.
 *
 * Event → Action mapping (SDD §24.4 → GAP-SVC-04):
 *   LessonCompleted        → +XP_LESSON, check daily streak
 *   HomeworkSubmitted      → +XP_HOMEWORK_SUBMIT
 *   QuizAttemptSubmitted   → +XP_QUIZ (bonus for high score)
 *   AttendanceRecorded (present) → +XP_ATTENDANCE, check streak
 *   CourseCompleted        → +XP_COURSE, evaluate course-completion badges
 *   QAAnswerAccepted       → +XP_ACCEPTED_ANSWER, evaluate helper badges
 *
 * GAP-SVC-04: SRS §20.4, SDD §24.4
 */
@Injectable()
export class GamificationListenerService {
  private readonly logger = new Logger(GamificationListenerService.name);

  // XP values (configurable per-org in future)
  private readonly XP = {
    LESSON_COMPLETE: 10,
    HOMEWORK_SUBMIT: 15,
    QUIZ_COMPLETE: 20,
    QUIZ_PERFECT: 10,      // bonus for 100%
    ATTENDANCE_PRESENT: 5,
    COURSE_COMPLETE: 100,
    ACCEPTED_ANSWER: 25,
  } as const;

  constructor(private readonly dataSource: DataSource) {}

  @OnEvent('lms.lesson_completed')
  async onLessonCompleted(payload: {
    userId: string;
    lessonId: string;
    organizationId: string;
  }) {
    await this.awardXp(payload.userId, payload.organizationId, this.XP.LESSON_COMPLETE, 'lesson_completed', payload.lessonId);
    await this.updateStreak(payload.userId, payload.organizationId, 'lesson');
    this.logger.debug(`Gamification: lesson_completed → +${this.XP.LESSON_COMPLETE} XP for user ${payload.userId}`);
  }

  @OnEvent('lms.homework_submitted')
  async onHomeworkSubmitted(payload: {
    userId: string;
    homeworkId: string;
    organizationId: string;
  }) {
    await this.awardXp(payload.userId, payload.organizationId, this.XP.HOMEWORK_SUBMIT, 'homework_submitted', payload.homeworkId);
    this.logger.debug(`Gamification: homework_submitted → +${this.XP.HOMEWORK_SUBMIT} XP for user ${payload.userId}`);
  }

  @OnEvent('assessment.quiz_attempt_submitted')
  async onQuizAttemptSubmitted(payload: {
    userId: string;
    attemptId: string;
    score: number;
    maxScore: number;
    organizationId: string;
  }) {
    let xp = this.XP.QUIZ_COMPLETE;
    const percentage = payload.maxScore > 0 ? (payload.score / payload.maxScore) * 100 : 0;
    if (percentage === 100) xp += this.XP.QUIZ_PERFECT;

    await this.awardXp(payload.userId, payload.organizationId, xp, 'quiz_submitted', payload.attemptId);
    await this.evaluateBadges(payload.userId, payload.organizationId, 'quiz_submitted', { percentage });
    this.logger.debug(`Gamification: quiz_submitted → +${xp} XP for user ${payload.userId}`);
  }

  @OnEvent('attendance.recorded')
  async onAttendanceRecorded(payload: {
    userId: string;
    status: string;
    organizationId: string;
    recordId: string;
  }) {
    if (payload.status !== 'present') return;
    await this.awardXp(payload.userId, payload.organizationId, this.XP.ATTENDANCE_PRESENT, 'attendance_present', payload.recordId);
    await this.updateStreak(payload.userId, payload.organizationId, 'attendance');
    this.logger.debug(`Gamification: attendance_present → +${this.XP.ATTENDANCE_PRESENT} XP for user ${payload.userId}`);
  }

  @OnEvent('lms.course_completed')
  async onCourseCompleted(payload: {
    userId: string;
    courseId: string;
    organizationId: string;
  }) {
    await this.awardXp(payload.userId, payload.organizationId, this.XP.COURSE_COMPLETE, 'course_completed', payload.courseId);
    await this.evaluateBadges(payload.userId, payload.organizationId, 'course_completed', { courseId: payload.courseId });
    this.logger.log(`Gamification: 🏆 course_completed → +${this.XP.COURSE_COMPLETE} XP for user ${payload.userId}`);
  }

  @OnEvent('collaboration.qa_answer_accepted')
  async onQaAnswerAccepted(payload: {
    userId: string;
    answerId: string;
    organizationId: string;
  }) {
    await this.awardXp(payload.userId, payload.organizationId, this.XP.ACCEPTED_ANSWER, 'accepted_answer', payload.answerId);
    await this.evaluateBadges(payload.userId, payload.organizationId, 'accepted_answer', {});
    this.logger.debug(`Gamification: accepted_answer → +${this.XP.ACCEPTED_ANSWER} XP for user ${payload.userId}`);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async awardXp(
    userId: string,
    organizationId: string,
    amount: number,
    reason: string,
    entityId: string,
  ) {
    await this.dataSource.query(
      `
      INSERT INTO xp_records (id, user_id, organization_id, amount, reason, entity_id, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
      `,
      [userId, organizationId, amount, reason, entityId],
    ).catch((err) => this.logger.error(`XP award failed: ${err.message}`));

    // Update cumulative XP total on user_gamification_profiles
    await this.dataSource.query(
      `
      INSERT INTO user_gamification_profiles (id, user_id, organization_id, total_xp, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      ON CONFLICT (user_id, organization_id)
      DO UPDATE SET total_xp = user_gamification_profiles.total_xp + $3, updated_at = NOW()
      `,
      [userId, organizationId, amount],
    ).catch((err) => this.logger.error(`XP profile update failed: ${err.message}`));
  }

  private async updateStreak(userId: string, organizationId: string, type: string) {
    await this.dataSource.query(
      `
      INSERT INTO streaks (id, user_id, organization_id, streak_type, current_count, last_activity_date, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, 1, CURRENT_DATE, NOW())
      ON CONFLICT (user_id, organization_id, streak_type)
      DO UPDATE SET
        current_count = CASE
          WHEN streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN streaks.current_count + 1
          WHEN streaks.last_activity_date = CURRENT_DATE THEN streaks.current_count
          ELSE 1
        END,
        longest_count = GREATEST(
          streaks.longest_count,
          CASE WHEN streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN streaks.current_count + 1 ELSE 1 END
        ),
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
      `,
      [userId, organizationId, type],
    ).catch((err) => this.logger.error(`Streak update failed: ${err.message}`));
  }

  private async evaluateBadges(
    userId: string,
    organizationId: string,
    trigger: string,
    _context: Record<string, any>,
  ) {
    // Badge evaluation is rule-based. This stub emits an event for
    // the BadgeEvaluatorService to pick up asynchronously.
    // Full implementation: query badge_rules, evaluate conditions, award badge_awards.
    this.logger.debug(`Badge evaluation triggered: ${trigger} for user ${userId}`);
  }
}
