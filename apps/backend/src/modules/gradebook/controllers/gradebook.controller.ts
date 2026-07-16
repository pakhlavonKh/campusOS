import { Controller, Post, Get, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GradebookService } from '../services/gradebook.service';
import { CurrentUser, TenantId } from '../../../common/decorators/tenant.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { RecordGradeDto } from '../dto/record-grade.dto';

@ApiTags('gradebook')
@ApiBearerAuth()
@Controller('gradebook')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GradebookController {
  constructor(private readonly gradebookService: GradebookService) {}

  @Get(':courseId/categories')
  @Roles('instructor', 'admin', 'student')
  async getCategories(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @TenantId() organizationId: string,
  ) {
    const data = await this.gradebookService.getCategories(courseId, organizationId);
    return { success: true, data };
  }

  @Post(':courseId/categories')
  @Roles('instructor', 'admin')
  async createCategory(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateCategoryDto,
    @TenantId() organizationId: string,
  ) {
    const data = await this.gradebookService.createCategory({ ...dto, courseId, organizationId });
    return { success: true, data };
  }

  @Post('entries/:entryId/grade')
  @Roles('instructor', 'admin')
  async recordGrade(
    @Param('entryId', ParseUUIDPipe) entryId: string,
    @Body() dto: RecordGradeDto,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.gradebookService.recordGrade({
      entryId,
      organizationId,
      score: dto.score,
      gradedBy: userId,
      reason: dto.reason,
    });
    return { success: true, data };
  }

  @Get(':courseId/student/:studentId')
  @Roles('student', 'instructor', 'admin')
  async getStudentGrades(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @TenantId() organizationId: string,
  ) {
    const data = await this.gradebookService.getStudentGrades(studentId, courseId, organizationId);
    const overall = await this.gradebookService.calculateCourseGrade(studentId, courseId, organizationId);
    return { success: true, data: { entries: data, overallGrade: overall } };
  }
}
