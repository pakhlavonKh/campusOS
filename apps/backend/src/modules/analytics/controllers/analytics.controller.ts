import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { TenantId, CurrentUser } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('courses/grades')
  @Permissions('analytics:read')
  async getCourseAverages(
    @TenantId() organizationId: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.analyticsService.getCourseAverages(organizationId, user);
    return { success: true, data };
  }

  @Get('courses/attendance')
  @Permissions('analytics:read')
  async getAttendanceRates(
    @TenantId() organizationId: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.analyticsService.getAttendanceRates(organizationId, user);
    return { success: true, data };
  }
}
