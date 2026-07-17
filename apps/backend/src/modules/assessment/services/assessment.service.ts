import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  // Question Bank
  QuestionBank,
  QuestionCategory,
  Question,
  QuestionVersion,
  // Quiz
  Quiz,
  QuizConfiguration,
  QuizQuestion,
  QuizAttempt,
  QuizResponse,
  // Anti-Cheat
  AntiCheatConfiguration,
  AntiCheatLog,
  // Legacy
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
} from '../entities/assessment.entity';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(QuestionBank) private readonly bankRepo: Repository<QuestionBank>,
    @InjectRepository(QuestionCategory) private readonly categoryRepo: Repository<QuestionCategory>,
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(QuestionVersion) private readonly versionRepo: Repository<QuestionVersion>,
    @InjectRepository(Quiz) private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(QuizConfiguration) private readonly configRepo: Repository<QuizConfiguration>,
    @InjectRepository(QuizQuestion) private readonly quizQuestionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizAttempt) private readonly quizAttemptRepo: Repository<QuizAttempt>,
    @InjectRepository(QuizResponse) private readonly responseRepo: Repository<QuizResponse>,
    @InjectRepository(AntiCheatConfiguration) private readonly antiCheatConfigRepo: Repository<AntiCheatConfiguration>,
    @InjectRepository(AntiCheatLog) private readonly antiCheatLogRepo: Repository<AntiCheatLog>,
    // Legacy repos
    @InjectRepository(Assessment) private readonly assessmentRepo: Repository<Assessment>,
    @InjectRepository(AssessmentQuestion) private readonly legacyQuestionRepo: Repository<AssessmentQuestion>,
    @InjectRepository(AssessmentAttempt) private readonly legacyAttemptRepo: Repository<AssessmentAttempt>,
  ) {}

  // ── Question Bank ──────────────────────────────────────────────────────────

  async createQuestionBank(dto: Partial<QuestionBank> & { organizationId: string }) {
    const bank = this.bankRepo.create(dto);
    return this.bankRepo.save(bank);
  }

  async createCategory(dto: Partial<QuestionCategory> & { organizationId: string; bankId: string }) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async createQuestion(dto: Partial<Question> & { organizationId: string; bankId: string }) {
    const question = this.questionRepo.create(dto);
    const saved = await this.questionRepo.save(question);

    // Save initial version
    await this.versionRepo.save(
      this.versionRepo.create({
        organizationId: dto.organizationId,
        questionId: saved.id,
        revision: 1,
        snapshot: saved as any,
        changeSummary: 'Initial creation',
      }),
    );

    return saved;
  }

  async updateQuestion(id: string, organizationId: string, dto: Partial<Question>) {
    const question = await this.questionRepo.findOne({ where: { id, organizationId } });
    if (!question) throw new NotFoundException('Question not found');

    // Update version
    question.currentVersion += 1;
    Object.assign(question, dto);
    const saved = await this.questionRepo.save(question);

    // Save version history snapshot
    await this.versionRepo.save(
      this.versionRepo.create({
        organizationId,
        questionId: saved.id,
        revision: saved.currentVersion,
        snapshot: saved as any,
        changeSummary: 'Updated fields',
      }),
    );

    return saved;
  }

  async getQuestions(bankId: string, organizationId: string) {
    return this.questionRepo.find({ where: { bankId, organizationId } });
  }

  // ── Quiz Delivery ──────────────────────────────────────────────────────────

  async createQuiz(dto: Partial<Quiz> & { organizationId: string; config?: Partial<QuizConfiguration> }) {
    const quiz = this.quizRepo.create(dto);
    const savedQuiz = await this.quizRepo.save(quiz);

    const config = this.configRepo.create({
      ...dto.config,
      organizationId: dto.organizationId,
      quizId: savedQuiz.id,
    });
    await this.configRepo.save(config);

    const antiCheatConfig = this.antiCheatConfigRepo.create({
      organizationId: dto.organizationId,
      quizId: savedQuiz.id,
    });
    await this.antiCheatConfigRepo.save(antiCheatConfig);

    return savedQuiz;
  }

  async addQuizQuestion(dto: Partial<QuizQuestion> & { quizId: string; organizationId: string }) {
    const quizQuestion = this.quizQuestionRepo.create(dto);
    return this.quizQuestionRepo.save(quizQuestion);
  }

  async startQuizAttempt(quizId: string, studentId: string, organizationId: string) {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId, organizationId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const config = await this.configRepo.findOne({ where: { quizId } });
    if (!config) throw new NotFoundException('Quiz configuration not found');

    // Check attempts limit
    const pastAttemptsCount = await this.quizAttemptRepo.count({
      where: { quizId, studentId, organizationId },
    });

    if (pastAttemptsCount >= config.maxAttempts) {
      throw new BadRequestException(`Maximum attempts (${config.maxAttempts}) reached for this quiz.`);
    }

    // Check availability dates
    const now = new Date();
    if (config.availableFrom && now < config.availableFrom) {
      throw new BadRequestException('This quiz is not open for attempts yet.');
    }
    if (config.availableUntil && now > config.availableUntil) {
      throw new BadRequestException('This quiz availability window has closed.');
    }

    // Find quiz questions to fix order (randomize or preserve)
    const quizQuestions = await this.quizQuestionRepo.find({
      where: { quizId, organizationId },
      order: { position: 'ASC' },
    });

    let questionIds = quizQuestions.map((q: QuizQuestion) => q.questionId).filter((id: string | null): id is string => id !== null);

    if (config.shuffleQuestions) {
      questionIds = questionIds.sort(() => Math.random() - 0.5);
    }

    const attempt = this.quizAttemptRepo.create({
      organizationId,
      quizId,
      studentId,
      attemptNumber: pastAttemptsCount + 1,
      status: 'in_progress',
      startedAt: now,
      questionOrder: questionIds,
    });

    return this.quizAttemptRepo.save(attempt);
  }

  // ── Anti-Cheat ─────────────────────────────────────────────────────────────

  async recordQuizViolation(
    attemptId: string,
    violationType:
      | 'tab_switch'
      | 'window_blur'
      | 'fullscreen_exit'
      | 'clipboard_copy'
      | 'clipboard_paste'
      | 'right_click'
      | 'suspicious_pattern'
      | 'webcam_absent'
      | 'auto_submitted',
    organizationId: string,
    metadata?: Record<string, any>,
  ) {
    const attempt = await this.quizAttemptRepo.findOne({ where: { id: attemptId, organizationId } });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== 'in_progress') {
      throw new BadRequestException('Cannot record violation for a inactive/submitted attempt');
    }

    // Load anti-cheat config
    const antiCheatConfig = await this.antiCheatConfigRepo.findOne({ where: { quizId: attempt.quizId, organizationId } });
    const maxViolations = antiCheatConfig?.maxViolations || 5;

    // Log the violation
    const log = this.antiCheatLogRepo.create({
      organizationId,
      attemptId,
      quizId: attempt.quizId,
      studentId: attempt.studentId,
      violationType,
      severity: violationType === 'auto_submitted' ? 'critical' : 'warning',
      metadata: metadata || {},
    });
    await this.antiCheatLogRepo.save(log);

    // Count violations
    const violationsCount = await this.antiCheatLogRepo.count({
      where: { attemptId },
    });

    if (violationsCount >= maxViolations) {
      // Auto submit due to excessive violations
      await this.submitQuizAttempt(attemptId, [], organizationId, true);
      return { autoSubmitted: true, violationsCount };
    }

    return { autoSubmitted: false, violationsCount };
  }

  async submitQuizAttempt(
    attemptId: string,
    responses: { questionId: string; answer: any }[],
    organizationId: string,
    autoSubmitted = false,
  ) {
    const attempt = await this.quizAttemptRepo.findOne({ where: { id: attemptId, organizationId } });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status === 'submitted') throw new BadRequestException('Attempt already submitted');

    const config = await this.configRepo.findOne({ where: { quizId: attempt.quizId, organizationId } });

    // Load actual quiz questions
    const quizQuestions = await this.quizQuestionRepo.find({
      where: { quizId: attempt.quizId, organizationId },
    });

    const questionIds = quizQuestions.map((q: QuizQuestion) => q.questionId).filter((id: string | null): id is string => id !== null);
    const questions = await this.questionRepo.findByIds(questionIds);

    let earnedPoints = 0;
    let maxPoints = 0;

    // Save response records and perform automatic grading
    for (const question of questions) {
      const responseDto = responses.find((r) => r.questionId === question.id);
      const studentAns = responseDto?.answer;

      const qQuestion = quizQuestions.find((qq) => qq.questionId === question.id);
      const points = qQuestion?.pointsOverride ? Number(qQuestion.pointsOverride) : Number(question.defaultPoints);
      maxPoints += points;

      let score = 0;
      let isCorrect = false;

      // Automated MCQ / MCQ-select grading
      if (question.type === 'multiple_choice' && studentAns) {
        isCorrect = studentAns === question.content.correctAnswer;
        score = isCorrect ? points : 0;
      } else if (question.type === 'true_false' && studentAns !== undefined) {
        isCorrect = String(studentAns) === String(question.content.correctAnswer);
        score = isCorrect ? points : 0;
      }

      earnedPoints += score;

      await this.responseRepo.save(
        this.responseRepo.create({
          organizationId,
          attemptId,
          questionId: question.id,
          answer: studentAns || null,
          score,
          maxScore: points,
          isCorrect,
          isAutoGraded: ['multiple_choice', 'true_false'].includes(question.type),
        }),
      );
    }

    const percentage = maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : 100;
    const isPassed = config?.passingScore ? percentage >= Number(config.passingScore) : null;

    attempt.status = autoSubmitted ? 'voided' : 'submitted';
    attempt.score = earnedPoints;
    attempt.maxScore = maxPoints;
    attempt.percentage = percentage;
    attempt.isPassed = isPassed;
    attempt.submittedAt = new Date();
    attempt.timeSpentSeconds = Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);

    return this.quizAttemptRepo.save(attempt);
  }

  // ── Legacy Compatibility methods (Assessment Monolithic) ──────────────────

  async createAssessment(dto: Partial<Assessment> & { organizationId: string }) {
    const assessment = this.assessmentRepo.create(dto);
    return this.assessmentRepo.save(assessment);
  }

  async createAssessmentQuestion(dto: Partial<AssessmentQuestion> & { organizationId: string }) {
    const question = this.legacyQuestionRepo.create(dto);
    return this.legacyQuestionRepo.save(question);
  }

  async startAttempt(assessmentId: string, studentId: string, organizationId: string) {
    const assessment = await this.assessmentRepo.findOne({ where: { id: assessmentId, organizationId } });
    if (!assessment) throw new NotFoundException('Assessment not found');

    const pastAttemptsCount = await this.legacyAttemptRepo.count({
      where: { assessmentId, studentId, organizationId },
    });

    if (pastAttemptsCount >= assessment.maxAttempts) {
      throw new BadRequestException(`Maximum attempts (${assessment.maxAttempts}) reached for this assessment.`);
    }

    const attempt = this.legacyAttemptRepo.create({
      organizationId,
      assessmentId,
      studentId,
      status: 'in_progress',
      focusViolationsCount: 0,
    });

    return this.legacyAttemptRepo.save(attempt);
  }

  async recordFocusViolation(attemptId: string, organizationId: string) {
    const attempt = await this.legacyAttemptRepo.findOne({ where: { id: attemptId, organizationId } });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status === 'submitted') throw new BadRequestException('Cannot record violation for a submitted attempt');

    attempt.focusViolationsCount += 1;
    return this.legacyAttemptRepo.save(attempt);
  }

  async submitAttempt(attemptId: string, answers: { questionId: string; answer: string }[], organizationId: string) {
    const attempt = await this.legacyAttemptRepo.findOne({ where: { id: attemptId, organizationId } });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status === 'submitted') throw new BadRequestException('Attempt already submitted');

    const questions = await this.legacyQuestionRepo.find({ where: { assessmentId: attempt.assessmentId, organizationId } });

    let correctCount = 0;
    let totalMCQs = 0;

    for (const question of questions) {
      if (question.type === 'multiple_choice') {
        totalMCQs += 1;
        const studentAns = answers.find((a) => a.questionId === question.id)?.answer;
        if (studentAns === question.correctAnswer) {
          correctCount += 1;
        }
      }
    }

    const score = totalMCQs > 0 ? (correctCount / totalMCQs) * 100 : 100;

    attempt.score = score;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();

    return this.legacyAttemptRepo.save(attempt);
  }
}
