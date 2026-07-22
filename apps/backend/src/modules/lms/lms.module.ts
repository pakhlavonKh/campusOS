import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Subject, Course, CourseModule, Lesson, ContentBlock,
  Homework, HomeworkSubmission, CourseEnrollment, CompletionRecord,
  // Extended hierarchy (SRS §5.7.1, SDD §3.2.6)
  Program, Level, Curriculum, CurriculumVersion,
  Section, Unit, Topic, CourseTemplate, Prerequisite, ReusableBlock,
} from './entities/lms.entity';
import { CourseService } from './services/course.service';
import { CompletionService } from './services/completion.service';
import { CourseController } from './controllers/course.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject, Course, CourseModule, Lesson, ContentBlock,
      Homework, HomeworkSubmission, CourseEnrollment, CompletionRecord,
      Program, Level, Curriculum, CurriculumVersion,
      Section, Unit, Topic, CourseTemplate, Prerequisite, ReusableBlock,
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService, CompletionService],
  exports: [CourseService, CompletionService, TypeOrmModule],
})
export class LmsModule {}
