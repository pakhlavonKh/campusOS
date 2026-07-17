import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { BranchesService } from '../services/branches.service';
import { TenantId } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RbacGuard } from '../../../common/guards/rbac.guard';

class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

class UpdateBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive';
}

class CreateRoomDto {
  @IsString()
  name: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentList?: string[];
}

class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentList?: string[];

  @IsString()
  @IsOptional()
  status?: 'available' | 'unavailable' | 'maintenance';
}

@ApiTags('branches')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RbacGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchService: BranchesService) {}

  @Post()
  @Permissions('branch:create')
  @ApiOperation({ summary: 'Create a new branch' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateBranchDto) {
    const branch = await this.branchService.create(tenantId, dto);
    return {
      success: true,
      data: branch,
    };
  }

  @Get()
  @Permissions('branch:read')
  @ApiOperation({ summary: 'List all branches' })
  async findAll(@TenantId() tenantId: string) {
    const branches = await this.branchService.findAll(tenantId);
    return {
      success: true,
      data: branches,
    };
  }

  @Get(':id')
  @Permissions('branch:read')
  @ApiOperation({ summary: 'Get branch details' })
  async findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    const branch = await this.branchService.findOne(id, tenantId);
    return {
      success: true,
      data: branch,
    };
  }

  @Put(':id')
  @Permissions('branch:update')
  @ApiOperation({ summary: 'Update branch details' })
  async update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    const branch = await this.branchService.update(id, tenantId, dto);
    return {
      success: true,
      data: branch,
    };
  }

  @Post(':branchId/rooms')
  @Permissions('branch:update')
  @ApiOperation({ summary: 'Create a room under a branch' })
  async createRoom(
    @TenantId() tenantId: string,
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Body() dto: CreateRoomDto,
  ) {
    const room = await this.branchService.createRoom(tenantId, branchId, dto);
    return {
      success: true,
      data: room,
    };
  }

  @Get(':branchId/rooms')
  @Permissions('branch:read')
  @ApiOperation({ summary: 'List rooms under a branch' })
  async findRooms(@TenantId() tenantId: string, @Param('branchId', ParseUUIDPipe) branchId: string) {
    const rooms = await this.branchService.findRooms(branchId, tenantId);
    return {
      success: true,
      data: rooms,
    };
  }

  @Get(':branchId/rooms/:roomId')
  @Permissions('branch:read')
  @ApiOperation({ summary: 'Get room details' })
  async findOneRoom(
    @TenantId() tenantId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
  ) {
    const room = await this.branchService.findOneRoom(roomId, tenantId);
    return {
      success: true,
      data: room,
    };
  }

  @Put(':branchId/rooms/:roomId')
  @Permissions('branch:update')
  @ApiOperation({ summary: 'Update room details' })
  async updateRoom(
    @TenantId() tenantId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Body() dto: UpdateRoomDto,
  ) {
    const room = await this.branchService.updateRoom(roomId, tenantId, dto);
    return {
      success: true,
      data: room,
    };
  }

  @Delete(':branchId/rooms/:roomId')
  @Permissions('branch:update')
  @ApiOperation({ summary: 'Delete a room' })
  async deleteRoom(
    @TenantId() tenantId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
  ) {
    await this.branchService.deleteRoom(roomId, tenantId);
    return {
      success: true,
      data: { message: 'Room deleted successfully' },
    };
  }
}
