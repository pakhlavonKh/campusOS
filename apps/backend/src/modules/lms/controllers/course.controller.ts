import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { CourseService } from '../services/course.service';
import { CurrentUser, TenantId } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RbacGuard } from '../../../common/guards/rbac.guard';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

class CreateCourseDto {
  @IsString() title: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(['topic_based', 'week_based', 'semester_based', 'self_paced', 'instructor_led'])
  @IsOptional() format?: string;
  @IsUUID() @IsOptional() subjectId?: string;
  @IsUUID() @IsOptional() branchId?: string;
}

class CreateModuleDto {
  @IsString() title: string;
  @IsOptional() position?: number;
  @IsUUID() @IsOptional() parentModuleId?: string;
}

class CreateLessonDto {
  @IsString() title: string;
  @IsOptional() position?: number;
}

@ApiTags('courses')
@ApiBearerAuth()
@Controller('courses')
@UseGuards(AuthGuard('jwt'), RbacGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Permissions('course:create')
  @ApiOperation({ summary: 'Create a new course' })
  async create(
    @Body() dto: CreateCourseDto,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const course = await this.courseService.create({
      ...dto,
      organizationId,
      createdBy: userId,
    });
    return { success: true, data: course, timestamp: new Date().toISOString() };
  }

  @Get()
  @Permissions('course:read')
  @ApiOperation({ summary: 'List all courses' })
  async findAll(
    @TenantId() organizationId: string,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.courseService.findAll(organizationId, pagination);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  @Get(':id')
  @Permissions('course:read')
  @ApiOperation({ summary: 'Get course by ID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() organizationId: string,
  ) {
    const course = await this.courseService.findOne(id, organizationId);
    return { success: true, data: course, timestamp: new Date().toISOString() };
  }

  @Put(':id')
  @Permissions('course:update')
  @ApiOperation({ summary: 'Update a course' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCourseDto>,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const course = await this.courseService.update(id, organizationId, {
      ...dto,
      updatedBy: userId,
    } as any);
    return { success: true, data: course, timestamp: new Date().toISOString() };
  }

  @Post(':id/publish')
  @Permissions('course:update')
  @ApiOperation({ summary: 'Publish a course' })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() organizationId: string,
  ) {
    const course = await this.courseService.publish(id, organizationId);
    return { success: true, data: course, timestamp: new Date().toISOString() };
  }

  @Delete(':id')
  @Permissions('course:delete')
  @ApiOperation({ summary: 'Soft-delete a course' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() organizationId: string,
  ) {
    await this.courseService.remove(id, organizationId);
    return { success: true, data: null, timestamp: new Date().toISOString() };
  }

  // ── Modules ──

  @Post(':courseId/modules')
  @Permissions('lesson:create')
  @ApiOperation({ summary: 'Create a module within a course' })
  async createModule(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateModuleDto,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const module = await this.courseService.createModule({
      organizationId,
      courseId,
      title: dto.title,
      position: dto.position || 0,
      parentModuleId: dto.parentModuleId,
      createdBy: userId,
    });
    return { success: true, data: module, timestamp: new Date().toISOString() };
  }

  @Get(':courseId/modules')
  @Permissions('course:read')
  @ApiOperation({ summary: 'List modules in a course' })
  async getModules(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @TenantId() organizationId: string,
  ) {
    const modules = await this.courseService.getModules(courseId, organizationId);
    return { success: true, data: modules, timestamp: new Date().toISOString() };
  }

  // ── Lessons ──

  @Post(':courseId/modules/:moduleId/lessons')
  @Permissions('lesson:create')
  @ApiOperation({ summary: 'Create a lesson within a module' })
  async createLesson(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() dto: CreateLessonDto,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const lesson = await this.courseService.createLesson({
      organizationId,
      moduleId,
      title: dto.title,
      position: dto.position || 0,
      createdBy: userId,
    });
    return { success: true, data: lesson, timestamp: new Date().toISOString() };
  }

  // ── Enrollment ──

  @Post(':courseId/enroll')
  @ApiOperation({ summary: 'Enroll current user in a course' })
  async enroll(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const enrollment = await this.courseService.enrollStudent({
      organizationId,
      userId,
      courseId,
    });
    return { success: true, data: enrollment, timestamp: new Date().toISOString() };
  }

  // ── Completion & Progress ──

  @Post(':courseId/lessons/:lessonId/complete')
  @ApiOperation({ summary: 'Mark a lesson complete for the current user' })
  async completeLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.courseService.markLessonComplete(userId, lessonId, organizationId);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Get(':courseId/progress')
  @ApiOperation({ summary: 'Get course progress for the current user' })
  async getProgress(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @TenantId() organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.courseService.getProgress(courseId, userId, organizationId);
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}
