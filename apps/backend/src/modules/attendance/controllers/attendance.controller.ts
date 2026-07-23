import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { AttendanceService } from '../services/attendance.service';
import { TenantId, CurrentUser } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RbacGuard } from '../../../common/guards/rbac.guard';

class RecordAttendanceDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  @IsOptional()
  classId?: string;

  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @IsString()
  date: string;

  @IsEnum(['present', 'absent', 'late', 'excused'])
  status: 'present' | 'absent' | 'late' | 'excused';

  @IsString()
  @IsOptional()
  notes?: string;
}

class RequestCorrectionDto {
  @IsUUID()
  recordId: string;

  @IsEnum(['present', 'absent', 'late', 'excused'])
  newStatus: 'present' | 'absent' | 'late' | 'excused';

  @IsString()
  reason: string;
}

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RbacGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Permissions('attendance:manage')
  @ApiOperation({ summary: 'Record student attendance' })
  async record(
    @TenantId() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: RecordAttendanceDto,
  ) {
    const record = await this.attendanceService.recordAttendance(tenantId, {
      ...dto,
      recordedBy: userId,
    });
    return {
      success: true,
      data: record,
    };
  }

  @Get('students/:studentId')
  @Permissions('attendance:read')
  @ApiOperation({ summary: "Get student's attendance history" })
  async getStudentHistory(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const roles: string[] = user?.roles || [];
    const adminOrTeacherRoles = ['admin', 'super_admin', 'org_admin', 'branch_admin', 'teacher', 'instructor'];
    const isStudentOnly = roles.some((r) => r.toLowerCase() === 'student') && !roles.some((r) => adminOrTeacherRoles.includes(r.toLowerCase()));

    if (isStudentOnly && user?.sub && studentId !== user.sub) {
      throw new ForbiddenException('Students can only view their own attendance history');
    }

    const history = await this.attendanceService.getStudentAttendance(
      tenantId,
      studentId,
      startDate,
      endDate,
    );
    return {
      success: true,
      data: history,
    };
  }

  @Get('classes/:classId')
  @Permissions('attendance:read')
  @ApiOperation({ summary: 'Get class attendance sheet' })
  async getClassAttendance(
    @TenantId() tenantId: string,
    @Param('classId', ParseUUIDPipe) classId: string,
    @Query('date') date: string,
  ) {
    const sheet = await this.attendanceService.getClassAttendance(tenantId, classId, date);
    return {
      success: true,
      data: sheet,
    };
  }

  @Post('corrections')
  @Permissions('attendance:read') // Student/Parent/Teacher can submit request
  @ApiOperation({ summary: 'Request an attendance correction' })
  async requestCorrection(
    @TenantId() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: RequestCorrectionDto,
  ) {
    const correction = await this.attendanceService.requestCorrection(tenantId, {
      ...dto,
      correctedBy: userId,
    });
    return {
      success: true,
      data: correction,
    };
  }

  @Post('corrections/:id/approve')
  @Permissions('attendance:manage')
  @ApiOperation({ summary: 'Approve an attendance correction request' })
  async approveCorrection(
    @TenantId() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) correctionId: string,
  ) {
    const record = await this.attendanceService.approveCorrection(
      tenantId,
      correctionId,
      userId,
    );
    return {
      success: true,
      data: record,
    };
  }

  @Get('stats')
  @Permissions('attendance:read')
  @ApiOperation({ summary: 'Get daily attendance statistics summary' })
  async getDailyStats(
    @TenantId() tenantId: string,
    @Query('date') date: string,
    @CurrentUser() user: any,
  ) {
    const stats = await this.attendanceService.getDailyStats(tenantId, date, user);
    return {
      success: true,
      data: stats,
    };
  }
}
