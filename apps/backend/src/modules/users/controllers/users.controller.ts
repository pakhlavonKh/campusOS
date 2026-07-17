import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { UsersService } from '../services/users.service';
import { CurrentUser } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RbacGuard } from '../../../common/guards/rbac.guard';

class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  locale?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

class CreateMembershipDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;
}

class UpdateMembershipStatusDto {
  @IsString()
  status: 'active' | 'suspended' | 'inactive';
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RbacGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    const user = await this.usersService.findOne(userId);
    return {
      success: true,
      data: user,
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(userId, dto);
    return {
      success: true,
      data: user,
    };
  }

  @Get('me/memberships')
  @ApiOperation({ summary: 'Get current user memberships' })
  async getMyMemberships(@CurrentUser('sub') userId: string) {
    const memberships = await this.usersService.getMemberships(userId);
    return {
      success: true,
      data: memberships,
    };
  }

  @Post('memberships')
  @Permissions('user:update')
  @ApiOperation({ summary: 'Create a new user membership (Admin only)' })
  async createMembership(@Body() dto: CreateMembershipDto) {
    const membership = await this.usersService.createMembership(
      dto.userId,
      dto.organizationId,
      dto.branchId,
    );
    return {
      success: true,
      data: membership,
    };
  }

  @Put('memberships/:id')
  @Permissions('user:update')
  @ApiOperation({ summary: 'Update membership status (Admin only)' })
  async updateMembershipStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMembershipStatusDto,
  ) {
    const membership = await this.usersService.updateMembershipStatus(id, dto.status);
    return {
      success: true,
      data: membership,
    };
  }

  @Post('parents/:parentId/students/:studentId')
  @Permissions('user:update')
  @ApiOperation({ summary: 'Link a parent user to a student user (Admin only)' })
  async linkParent(
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    const link = await this.usersService.linkParentToStudent(parentId, studentId);
    return {
      success: true,
      data: link,
    };
  }

  @Get('me/students')
  @ApiOperation({ summary: 'Get linked student profiles (for Parents)' })
  async getMyStudents(@CurrentUser('sub') userId: string) {
    const students = await this.usersService.getStudentsForParent(userId);
    return {
      success: true,
      data: students,
    };
  }

  @Get('me/parents')
  @ApiOperation({ summary: 'Get linked parent profiles (for Students)' })
  async getMyParents(@CurrentUser('sub') userId: string) {
    const parents = await this.usersService.getParentsForStudent(userId);
    return {
      success: true,
      data: parents,
    };
  }
}
