import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  // Question Bank
  QuestionBank, QuestionCategory, Question, QuestionVersion,
  // Quiz / Assessment
  Quiz, QuizConfiguration, QuizQuestion, QuizAttempt, QuizResponse,
  // Grading Rubrics (shared with Gradebook)
  GradingRubric, RubricCriterion,
  // Anti-Cheat
  AntiCheatConfiguration, AntiCheatLog,
  // Legacy (deprecated but kept for DB compat)
  Assessment, AssessmentQuestion, AssessmentAttempt,
} from './entities/assessment.entity';
import { AssessmentService } from './services/assessment.service';
import { AssessmentController } from './controllers/assessment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionBank, QuestionCategory, Question, QuestionVersion,
      Quiz, QuizConfiguration, QuizQuestion, QuizAttempt, QuizResponse,
      GradingRubric, RubricCriterion,
      AntiCheatConfiguration, AntiCheatLog,
      Assessment, AssessmentQuestion, AssessmentAttempt,
    ]),
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService, TypeOrmModule],
})
export class AssessmentModule {}
