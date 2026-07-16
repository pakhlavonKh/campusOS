import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Course, CourseModule, Lesson, ContentBlock, CourseEnrollment, CompletionRecord } from '../entities/lms.entity';
import { PaginationDto, PaginationMeta } from '../../../shared/dto/pagination.dto';

/**
 * CourseService — Course CRUD, format management, status transitions.
 * SDD §3.2.6 LMS Context.
 */
@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(CourseModule) private readonly moduleRepo: Repository<CourseModule>,
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(ContentBlock) private readonly contentBlockRepo: Repository<ContentBlock>,
    @InjectRepository(CourseEnrollment) private readonly enrollmentRepo: Repository<CourseEnrollment>,
    @InjectRepository(CompletionRecord) private readonly completionRepo: Repository<CompletionRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: {
    organizationId: string;
    branchId?: string;
    title: string;
    description?: string;
    format?: string;
    subjectId?: string;
    createdBy: string;
  }): Promise<Course> {
    const course = this.courseRepo.create({
      organizationId: dto.organizationId,
      branchId: dto.branchId || null,
      title: dto.title,
      description: dto.description || null,
      format: (dto.format as any) || 'topic_based',
      subjectId: dto.subjectId || null,
      createdBy: dto.createdBy,
      updatedBy: dto.createdBy,
    });

    const saved = await this.courseRepo.save(course);

    this.eventEmitter.emit('course.created', {
      eventType: 'course.created',
      aggregateId: saved.id,
      aggregateType: 'Course',
      organizationId: dto.organizationId,
      data: {
        courseId: saved.id,
        organizationId: dto.organizationId,
        branchId: dto.branchId,
        title: saved.title,
      },
    });

    this.logger.log(`Course created: ${saved.id} "${saved.title}"`);
    return saved;
  }

  async findAll(organizationId: string, pagination: PaginationDto) {
    const [courses, total] = await this.courseRepo.findAndCount({
      where: { organizationId },
      order: { createdAt: pagination.sortOrder || 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return {
      data: courses,
      meta: new PaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async findOne(id: string, organizationId: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id, organizationId },
    });

    if (!course) {
      throw new NotFoundException(`Course ${id} not found`);
    }

    return course;
  }

  async update(id: string, organizationId: string, dto: Partial<Course> & { updatedBy: string }) {
    const course = await this.findOne(id, organizationId);
    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  async publish(id: string, organizationId: string) {
    const course = await this.findOne(id, organizationId);
    course.status = 'published';
    const saved = await this.courseRepo.save(course);

    this.eventEmitter.emit('course.published', {
      eventType: 'course.published',
      aggregateId: saved.id,
      data: { courseId: saved.id, publishedAt: new Date().toISOString() },
    });

    return saved;
  }

  async archive(id: string, organizationId: string) {
    const course = await this.findOne(id, organizationId);
    course.status = 'archived';
    return this.courseRepo.save(course);
  }

  async remove(id: string, organizationId: string) {
    const course = await this.findOne(id, organizationId);
    return this.courseRepo.softRemove(course);
  }

  // ── Module (section) management ──

  async createModule(dto: {
    organizationId: string;
    courseId: string;
    title: string;
    position: number;
    parentModuleId?: string;
    createdBy: string;
  }): Promise<CourseModule> {
    const module = this.moduleRepo.create({
      organizationId: dto.organizationId,
      courseId: dto.courseId,
      title: dto.title,
      position: dto.position,
      parentModuleId: dto.parentModuleId || null,
      createdBy: dto.createdBy,
      updatedBy: dto.createdBy,
    });
    return this.moduleRepo.save(module);
  }

  async getModules(courseId: string, organizationId: string): Promise<CourseModule[]> {
    return this.moduleRepo.find({
      where: { courseId, organizationId },
      order: { position: 'ASC' },
    });
  }

  // ── Lesson management ──

  async createLesson(dto: {
    organizationId: string;
    moduleId: string;
    title: string;
    position: number;
    createdBy: string;
  }): Promise<Lesson> {
    const lesson = this.lessonRepo.create({
      organizationId: dto.organizationId,
      moduleId: dto.moduleId,
      title: dto.title,
      position: dto.position,
      createdBy: dto.createdBy,
      updatedBy: dto.createdBy,
    });
    return this.lessonRepo.save(lesson);
  }

  async getLessons(moduleId: string, organizationId: string): Promise<Lesson[]> {
    return this.lessonRepo.find({
      where: { moduleId, organizationId },
      order: { position: 'ASC' },
    });
  }

  // ── Enrollment ──

  async enrollStudent(dto: {
    organizationId: string;
    userId: string;
    courseId: string;
  }): Promise<CourseEnrollment> {
    const enrollment = this.enrollmentRepo.create({
      organizationId: dto.organizationId,
      userId: dto.userId,
      courseId: dto.courseId,
      createdBy: dto.userId,
      updatedBy: dto.userId,
    });

    const saved = await this.enrollmentRepo.save(enrollment);

    this.eventEmitter.emit('enrollment.created', {
      eventType: 'enrollment.created',
      aggregateId: saved.id,
      data: { userId: dto.userId, courseId: dto.courseId },
    });

    return saved;
  }

  // ── Completion Tracking & Progression ──

  async markLessonComplete(userId: string, lessonId: string, organizationId: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId, organizationId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }

    // Check if completion record already exists
    const existing = await this.completionRepo.findOne({
      where: { userId, entityType: 'lesson', entityId: lessonId, organizationId }
    });

    if (existing) {
      return existing;
    }

    // Save completion record
    const completion = this.completionRepo.create({
      userId,
      entityType: 'lesson',
      entityId: lessonId,
      organizationId,
    });
    const savedCompletion = await this.completionRepo.save(completion);

    // Emit event
    this.eventEmitter.emit('lesson.completed', {
      eventType: 'lesson.completed',
      data: { userId, lessonId, organizationId },
    });

    // Cascade: Check parent Module completion
    const parentModule = await this.moduleRepo.findOne({ where: { id: lesson.moduleId, organizationId } });
    if (parentModule) {
      const allLessons = await this.lessonRepo.find({ where: { moduleId: parentModule.id, organizationId } });
      const completedLessons = await this.completionRepo.find({
        where: {
          userId,
          entityType: 'lesson',
          organizationId,
        }
      });
      const completedLessonIds = completedLessons.map(c => c.entityId);

      const allLessonsCompleted = allLessons.every(l => completedLessonIds.includes(l.id));

      if (allLessonsCompleted && allLessons.length > 0) {
        // Mark module complete
        const moduleCompletionExisting = await this.completionRepo.findOne({
          where: { userId, entityType: 'module', entityId: parentModule.id, organizationId }
        });

        if (!moduleCompletionExisting) {
          await this.completionRepo.save(
            this.completionRepo.create({
              userId,
              entityType: 'module',
              entityId: parentModule.id,
              organizationId,
            })
          );

          this.eventEmitter.emit('module.completed', {
            eventType: 'module.completed',
            data: { userId, moduleId: parentModule.id, organizationId },
          });

          // Cascade: Check Course completion
          const allModules = await this.moduleRepo.find({ where: { courseId: parentModule.courseId, organizationId } });
          const completedModules = await this.completionRepo.find({
            where: {
              userId,
              entityType: 'module',
              organizationId,
            }
          });
          const completedModuleIds = completedModules.map(c => c.entityId);
          const allModulesCompleted = allModules.every(m => completedModuleIds.includes(m.id));

          if (allModulesCompleted && allModules.length > 0) {
            // Mark course complete
            const courseCompletionExisting = await this.completionRepo.findOne({
              where: { userId, entityType: 'course', entityId: parentModule.courseId, organizationId }
            });

            if (!courseCompletionExisting) {
              await this.completionRepo.save(
                this.completionRepo.create({
                  userId,
                  entityType: 'course',
                  entityId: parentModule.courseId,
                  organizationId,
                })
              );

              // Update Enrollment
              const enrollment = await this.enrollmentRepo.findOne({
                where: { userId, courseId: parentModule.courseId, organizationId }
              });
              if (enrollment) {
                enrollment.status = 'completed';
                enrollment.completedAt = new Date();
                await this.enrollmentRepo.save(enrollment);
              }

              this.eventEmitter.emit('course.completed', {
                eventType: 'course.completed',
                data: { userId, courseId: parentModule.courseId, organizationId },
              });
            }
          }
        }
      }
    }

    return savedCompletion;
  }

  async getProgress(courseId: string, userId: string, organizationId: string) {
    const modules = await this.moduleRepo.find({ where: { courseId, organizationId } });
    if (modules.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const moduleIds = modules.map(m => m.id);
    
    // Find all lessons in the course modules
    let totalLessonsCount = 0;
    const lessons: Lesson[] = [];
    for (const moduleId of moduleIds) {
      const moduleLessons = await this.lessonRepo.find({ where: { moduleId, organizationId } });
      lessons.push(...moduleLessons);
    }
    totalLessonsCount = lessons.length;

    if (totalLessonsCount === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    // Find how many of these lessons are completed by the user
    const lessonIds = lessons.map(l => l.id);
    const completions = await this.completionRepo.find({
      where: {
        userId,
        entityType: 'lesson',
        organizationId,
      }
    });

    const completedInCourse = completions.filter(c => lessonIds.includes(c.entityId));
    const completedCount = completedInCourse.length;
    const percentage = Math.round((completedCount / totalLessonsCount) * 100);

    return {
      completed: completedCount,
      total: totalLessonsCount,
      percentage,
    };
  }
}
