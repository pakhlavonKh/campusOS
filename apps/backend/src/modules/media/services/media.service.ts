import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAsset, TranscodingJob, MediaThumbnail } from '../entities/media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaAsset) private readonly assetRepo: Repository<MediaAsset>,
    @InjectRepository(TranscodingJob) private readonly jobRepo: Repository<TranscodingJob>,
    @InjectRepository(MediaThumbnail) private readonly thumbnailRepo: Repository<MediaThumbnail>,
  ) {}

  async createAsset(dto: Partial<MediaAsset> & { organizationId: string }) {
    const asset = this.assetRepo.create(dto);
    return this.assetRepo.save(asset);
  }

  async getAsset(id: string, organizationId: string) {
    const asset = await this.assetRepo.findOne({ where: { id, organizationId } });
    if (!asset) throw new NotFoundException('Media asset not found');
    return asset;
  }

  async createTranscodingJob(mediaAssetId: string, organizationId: string, preset = 'h264_aac_mp4') {
    const asset = await this.getAsset(mediaAssetId, organizationId);
    
    // Set asset state to processing
    asset.status = 'processing';
    await this.assetRepo.save(asset);

    const job = this.jobRepo.create({
      organizationId,
      mediaAssetId: asset.id,
      preset,
      status: 'queued',
    });
    return this.jobRepo.save(job);
  }

  async addThumbnail(mediaAssetId: string, organizationId: string, dto: Partial<MediaThumbnail>) {
    const thumbnail = this.thumbnailRepo.create({
      ...dto,
      organizationId,
      mediaAssetId,
    });
    return this.thumbnailRepo.save(thumbnail);
  }
}
