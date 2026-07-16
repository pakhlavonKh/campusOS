import { Controller, Post, Get, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { MediaService } from '../services/media.service';
import { TenantId } from '../../../common/decorators/tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RbacGuard } from '../../../common/guards/rbac.guard';

class CreateAssetDto {
  @IsString() originalName!: string;
  @IsString() s3Key!: string;
  @IsNumber() fileSizeBytes!: number;
  @IsString() mimeType!: string;
}

class TranscodePresetDto {
  @IsString() @IsOptional() preset?: string;
}

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(AuthGuard('jwt'), RbacGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @Permissions('media:create')
  @ApiOperation({ summary: 'Register a newly uploaded media asset' })
  async create(@Body() dto: CreateAssetDto, @TenantId() organizationId: string) {
    const data = await this.mediaService.createAsset({ ...dto, organizationId });
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('media:read')
  @ApiOperation({ summary: 'Get details of a media asset' })
  async get(@Param('id', ParseUUIDPipe) id: string, @TenantId() organizationId: string) {
    const data = await this.mediaService.getAsset(id, organizationId);
    return { success: true, data };
  }

  @Post(':id/transcode')
  @Permissions('media:update')
  @ApiOperation({ summary: 'Trigger video transcoding job' })
  async transcode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TranscodePresetDto,
    @TenantId() organizationId: string,
  ) {
    const data = await this.mediaService.createTranscodingJob(id, organizationId, dto.preset);
    return { success: true, data };
  }
}
