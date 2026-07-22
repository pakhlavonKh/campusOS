import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * CompletionService
 *
 * Implements bottom-up completion propagation as specified in SDD §24.7:
 *   lesson → module → course
 *
 * Each propagation runs inside a single database transaction to prevent
 * partial completion states.
 *
 * GAP-SVC-03: SRS §20.4, SDD §24.7
 */
@Injectable()
export class CompletionService {
  private readonly logger = new Logger(CompletionService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Mark a lesson as complete for a user and propagate upwards.
   * Emits: LessonCompleted, ModuleCompleted (if all lessons done), CourseCompleted (if all modules done).
   * All writes are in a single transaction.
   */
  async markLessonComplete(
    userId: string,
    lessonId: string,
    organizationId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. Upsert CompletionRecord for lesson
      await manager.query(
        `
        INSERT INTO completion_records (id, user_id, entity_type, entity_id, organization_id, completed_at)
        VALUES (gen_random_uuid(), $1, 'lesson', $2, $3, NOW())
        ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
        `,
        [userId, lessonId, organizationId],
      );

      this.eventEmitter.emit('lms.lesson_completed', { userId, lessonId, organizationId });
      this.logger.debug(`Lesson ${lessonId} completed by user ${userId}`);

      // 2. Find the parent module
      const lessonRows = await manager.query(
        `SELECT module_id FROM lessons WHERE id = $1`,
        [lessonId],
      );
      const moduleId = lessonRows?.[0]?.module_id;
      if (!moduleId) return;

      // 3. Check if all lessons in the module are complete
      const [{ total }] = await manager.query(
        `SELECT COUNT(*) AS total FROM lessons WHERE module_id = $1`,
        [moduleId],
      );
      const [{ done }] = await manager.query(
        `
        SELECT COUNT(*) AS done
        FROM completion_records cr
        JOIN lessons l ON l.id = cr.entity_id
        WHERE cr.user_id = $1 AND cr.entity_type = 'lesson' AND l.module_id = $2
        `,
        [userId, moduleId],
      );

      if (Number(done) < Number(total)) return; // Module not complete yet

      // 4. All lessons done → complete the module
      await manager.query(
        `
        INSERT INTO completion_records (id, user_id, entity_type, entity_id, organization_id, completed_at)
        VALUES (gen_random_uuid(), $1, 'module', $2, $3, NOW())
        ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
        `,
        [userId, moduleId, organizationId],
      );

      this.eventEmitter.emit('lms.module_completed', { userId, moduleId, organizationId });
      this.logger.debug(`Module ${moduleId} completed by user ${userId}`);

      // 5. Find the parent course
      const moduleRows = await manager.query(
        `SELECT course_id FROM modules WHERE id = $1`,
        [moduleId],
      );
      const courseId = moduleRows?.[0]?.course_id;
      if (!courseId) return;

      // 6. Check if all modules in the course are complete
      const [{ totalModules }] = await manager.query(
        `SELECT COUNT(*) AS "totalModules" FROM modules WHERE course_id = $1`,
        [courseId],
      );
      const [{ doneModules }] = await manager.query(
        `
        SELECT COUNT(*) AS "doneModules"
        FROM completion_records cr
        JOIN modules m ON m.id = cr.entity_id
        WHERE cr.user_id = $1 AND cr.entity_type = 'module' AND m.course_id = $2
        `,
        [userId, courseId],
      );

      if (Number(doneModules) < Number(totalModules)) return;

      // 7. All modules done → complete the course
      await manager.query(
        `
        INSERT INTO completion_records (id, user_id, entity_type, entity_id, organization_id, completed_at)
        VALUES (gen_random_uuid(), $1, 'course', $2, $3, NOW())
        ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
        `,
        [userId, courseId, organizationId],
      );

      this.eventEmitter.emit('lms.course_completed', { userId, courseId, organizationId });
      this.logger.log(`🎓 Course ${courseId} completed by user ${userId}`);
    });
  }

  /** Query completion progress for a course. */
  async getCourseProgress(
    courseId: string,
    userId: string,
    _organizationId: string,
  ): Promise<{ totalLessons: number; completedLessons: number; percentage: number; courseComplete: boolean }> {
    const [{ total }] = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = $1`,
      [courseId],
    );

    const [{ completed }] = await this.dataSource.query(
      `
      SELECT COUNT(*) AS completed
      FROM completion_records cr
      JOIN lessons l ON l.id = cr.entity_id
      JOIN modules m ON m.id = l.module_id
      WHERE cr.user_id = $1 AND cr.entity_type = 'lesson' AND m.course_id = $2
      `,
      [userId, courseId],
    );

    const totalLessons = Number(total);
    const completedLessons = Number(completed);
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const courseComplete = percentage === 100;

    return { totalLessons, completedLessons, percentage, courseComplete };
  }
}
