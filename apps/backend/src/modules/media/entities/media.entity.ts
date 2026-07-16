import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * MediaAsset — uploaded file reference with storage information.
 * SDD §11 Media Processing Pipeline.
 */
@Entity('media_assets')
@Index(['organizationId', 'status'])
export class MediaAsset extends BaseEntity {
  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName!: string;

  @Column({ name: 's3_key', type: 'varchar', length: 512 })
  s3Key!: string;

  @Column({ name: 'cdn_url', type: 'text', nullable: true })
  cdnUrl!: string | null;

  @Column({ name: 'file_size_bytes', type: 'bigint' })
  fileSizeBytes!: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ type: 'varchar', length: 30, default: 'uploaded' })
  status!: 'uploaded' | 'processing' | 'ready' | 'failed';

  @Column({ type: 'jsonb', default: '{}' })
  metadata!: Record<string, any>;
}

/**
 * TranscodingJob — async video/audio transcoding job.
 * SDD §11 — uses FFmpeg workers in the background.
 */
@Entity('transcoding_jobs')
@Index(['mediaAssetId'])
export class TranscodingJob extends BaseEntity {
  @Column({ name: 'media_asset_id', type: 'uuid' })
  mediaAssetId!: string;

  @Column({ name: 'preset', type: 'varchar', length: 50, default: 'h264_aac_mp4' })
  preset!: string;

  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status!: 'queued' | 'processing' | 'completed' | 'failed';

  @Column({ name: 'progress_percentage', type: 'int', default: 0 })
  progressPercentage!: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}

/**
 * MediaThumbnail — auto-generated image thumbnail for videos/assets.
 * SDD §11.
 */
@Entity('media_thumbnails')
@Index(['mediaAssetId'])
export class MediaThumbnail extends BaseEntity {
  @Column({ name: 'media_asset_id', type: 'uuid' })
  mediaAssetId!: string;

  @Column({ name: 's3_key', type: 'varchar', length: 512 })
  s3Key!: string;

  @Column({ name: 'cdn_url', type: 'text', nullable: true })
  cdnUrl!: string | null;

  @Column({ type: 'int' })
  width!: number;

  @Column({ type: 'int' })
  height!: number;
}
