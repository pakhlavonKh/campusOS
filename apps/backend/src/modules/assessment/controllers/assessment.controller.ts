import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentService } from '../services/assessment.service';
import { CurrentUser, TenantId } from '../../../common/decorators/tenant.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

class CreateAssessmentDto {
  @IsUUID() courseId!: string;
  @IsString() title!: string;
  @IsNumber() durationMinutes!: number;
  @IsNumber() @IsOptional() passingScore?: number;
  @IsNumber() @IsOptional() maxAttempts?: number;
}

class CreateQuestionDto {
  @IsString() text!: string;
  @IsEnum(['multiple_choice', 'open']) type!: 'multiple_choice' | 'open';
  @IsArray() @IsString({ each: true }) @IsOptional() options?: string[];
  @IsString() @IsOptional() correctAnswer?: string;
}

class AnswerDto {
  @IsUUID() questionId!: string;
  @IsString() answer!: string;
}

class SubmitAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}

@ApiTags('assessments')
@ApiBearerAuth()
@Controller('assessments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Create an assessment' })
  async create(
    @Body() dto: CreateAssessmentDto,
    @TenantId() organizationId: string,
  ) {
    const data = await this.assessmentService.createAssessment({ ...dto, organizationId });
    return { success: true, data };
  }

  @Post(':id/questions')
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Add a question to an assessment' })
  async addQuestion(
    @Param('id', ParseUUIDPipe) assessmentId: string,
    @Body() dto: CreateQuestionDto,
    @TenantId() organizationId: string,
  ) {
    const data = await this.assessmentService.createAssessmentQuestion({ ...dto, assessmentId, organizationId });
    return { success: true, data };
  }

  @Post(':id/start')
  @Roles('student', 'instructor', 'admin')
  @ApiOperation({ summary: 'Start a new assessment attempt for a student' })
  async startAttempt(
    @Param('id', ParseUUIDPipe) assessmentId: string,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.assessmentService.startAttempt(assessmentId, userId, organizationId);
    return { success: true, data };
  }

  @Post('attempts/:attemptId/violation')
  @Roles('student', 'instructor', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record focus violation / cheating attempt' })
  async recordViolation(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @TenantId() organizationId: string,
  ) {
    const data = await this.assessmentService.recordFocusViolation(attemptId, organizationId);
    return { success: true, data };
  }

  @Post('attempts/:attemptId/submit')
  @Roles('student', 'instructor', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit attempt responses for grading' })
  async submitAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SubmitAttemptDto,
    @TenantId() organizationId: string,
  ) {
    const data = await this.assessmentService.submitAttempt(attemptId, dto.answers, organizationId);
    return { success: true, data };
  }
}
