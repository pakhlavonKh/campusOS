import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  GradeCategory,
  GradeScale, GradeScaleMapping,
  GradebookEntry, GradeHistory, GradeApproval,
  ReportCard, Transcript,
} from './entities/gradebook.entity';
import { GradebookService } from './services/gradebook.service';
import { GradeCalculationService } from './services/grade-calculation.service';
import { GradebookController } from './controllers/gradebook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GradeCategory,
      GradeScale, GradeScaleMapping,
      GradebookEntry, GradeHistory, GradeApproval,
      ReportCard, Transcript,
    ]),
  ],
  controllers: [GradebookController],
  providers: [GradebookService, GradeCalculationService],
  exports: [GradebookService, GradeCalculationService, TypeOrmModule],
})
export class GradebookModule {}
