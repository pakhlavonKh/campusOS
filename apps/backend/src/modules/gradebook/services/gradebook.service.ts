import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GradeCategory, GradebookEntry, GradeHistory } from '../entities/gradebook.entity';

@Injectable()
export class GradebookService {
  constructor(
    @InjectRepository(GradeCategory) private readonly categoryRepo: Repository<GradeCategory>,
    @InjectRepository(GradebookEntry) private readonly entryRepo: Repository<GradebookEntry>,
    @InjectRepository(GradeHistory) private readonly historyRepo: Repository<GradeHistory>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ── Categories ──

  async createCategory(dto: Partial<GradeCategory> & { organizationId: string }) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async getCategories(courseId: string, organizationId: string) {
    return this.categoryRepo.find({
      where: { courseId, organizationId },
      order: { position: 'ASC' },
    });
  }

  // ── Entries ──

  async recordGrade(dto: {
    entryId: string;
    organizationId: string;
    score: number;
    gradedBy: string;
    reason?: string;
  }) {
    const entry = await this.entryRepo.findOne({
      where: { id: dto.entryId, organizationId: dto.organizationId },
    });

    if (!entry) throw new NotFoundException('Gradebook entry not found');

    const oldScore = entry.score;
    entry.score = dto.score;
    entry.status = 'graded';
    entry.gradedBy = dto.gradedBy;
    entry.gradedAt = new Date();
    
    const saved = await this.entryRepo.save(entry);

    // Save history
    await this.historyRepo.save(
      this.historyRepo.create({
        gradebookEntryId: entry.id,
        oldScore,
        newScore: dto.score,
        reason: dto.reason || 'Manual grading',
        changedBy: dto.gradedBy,
      })
    );

    // Emit event
    this.eventEmitter.emit('grade.recorded', {
      eventType: 'grade.recorded',
      data: { entryId: entry.id, studentId: entry.studentId, score: dto.score },
    });

    return saved;
  }

  async getStudentGrades(studentId: string, courseId: string, organizationId: string) {
    return this.entryRepo.find({
      where: { studentId, courseId, organizationId },
    });
  }

  // Simplified calculation based on categories
  async calculateCourseGrade(studentId: string, courseId: string, organizationId: string) {
    const categories = await this.getCategories(courseId, organizationId);
    const entries = await this.getStudentGrades(studentId, courseId, organizationId);

    let totalScore = 0;
    let totalWeight = 0;

    for (const cat of categories) {
      const catEntries = entries.filter((e) => e.categoryId === cat.id && e.score !== null);
      if (catEntries.length === 0) continue;

      let catEarned = 0;
      let catMax = 0;
      
      // Ignore drop lowest for simplicity in MVP
      catEntries.forEach((e) => {
        catEarned += e.score!;
        catMax += e.maxScore;
      });

      const catPercentage = catEarned / catMax;
      totalScore += catPercentage * cat.weight;
      totalWeight += cat.weight;
    }

    if (totalWeight === 0) return 0;
    return (totalScore / totalWeight) * 100;
  }
}
