import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/** ContentPackage — exported bundle (course + lessons + questions). SRS §5.24. */
@Entity('content_packages')
@Index(['organizationId'])
export class ContentPackage extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 30 })
  packageType: 'course' | 'curriculum' | 'question_bank' | 'mixed';

  @Column({ type: 'varchar', length: 30 })
  format: 'scorm_1_2' | 'scorm_2004' | 'qti' | 'ims_cc' | 'native_json' | 'xapi';

  @Column({ name: 's3_key', type: 'varchar', length: 512, nullable: true })
  s3Key: string | null;

  @Column({ name: 'file_size_bytes', type: 'bigint', nullable: true })
  fileSizeBytes: number | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'ready' | 'expired';

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;
}

/** ExportJob — async export job with status. SRS §5.24. */
@Entity('export_jobs')
@Index(['organizationId', 'status'])
export class ExportJob extends BaseEntity {
  @Column({ name: 'source_type', type: 'varchar', length: 30 })
  sourceType: 'course' | 'curriculum' | 'question_bank';

  @Column({ name: 'source_id', type: 'uuid' })
  sourceId: string;

  @Column({ type: 'varchar', length: 30 })
  format: 'scorm_1_2' | 'scorm_2004' | 'qti' | 'ims_cc' | 'native_json' | 'xapi';

  @Column({ name: 'package_id', type: 'uuid', nullable: true })
  packageId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status: 'queued' | 'processing' | 'completed' | 'failed';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}

/** ImportJob — async import job with validation results. SRS §5.24. */
@Entity('import_jobs')
@Index(['organizationId', 'status'])
export class ImportJob extends BaseEntity {
  @Column({ name: 'package_id', type: 'uuid', nullable: true })
  packageId: string | null;

  @Column({ name: 's3_key', type: 'varchar', length: 512 })
  s3Key: string;

  @Column({ type: 'varchar', length: 30 })
  format: 'scorm_1_2' | 'scorm_2004' | 'qti' | 'ims_cc' | 'native_json' | 'xapi';

  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status: 'queued' | 'validating' | 'importing' | 'completed' | 'failed';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'import_summary', type: 'jsonb', nullable: true })
  importSummary: Record<string, any> | null;
}

/** ImportValidation — per-item validation result. SRS §5.24. */
@Entity('import_validations')
@Index(['jobId'])
export class ImportValidation extends BaseEntity {
  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'item_type', type: 'varchar', length: 50 })
  itemType: string;

  @Column({ name: 'item_reference', type: 'varchar', length: 255 })
  itemReference: string;

  @Column({ type: 'varchar', length: 20 })
  severity: 'info' | 'warning' | 'error';

  @Column({ type: 'text' })
  message: string;
}

/** ContentVersion — immutable version snapshot of content. SRS §5.24. */
@Entity('content_versions')
@Index(['contentType', 'contentId', 'version'])
export class ContentVersion extends BaseEntity {
  @Column({ name: 'content_type', type: 'varchar', length: 50 })
  contentType: 'course' | 'lesson' | 'question' | 'question_bank';

  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'jsonb' })
  snapshot: Record<string, any>;

  @Column({ name: 'snapshot_hash', type: 'varchar', length: 64 })
  snapshotHash: string;
}

/** ContentDiff — diff between two content versions. SRS §5.24. */
@Entity('content_diffs')
@Index(['contentType', 'contentId'])
export class ContentDiff extends BaseEntity {
  @Column({ name: 'content_type', type: 'varchar', length: 50 })
  contentType: string;

  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  @Column({ name: 'from_version', type: 'int' })
  fromVersion: number;

  @Column({ name: 'to_version', type: 'int' })
  toVersion: number;

  /** JSON Patch (RFC 6902) array */
  @Column({ type: 'jsonb' })
  diff: Array<Record<string, any>>;

  @Column({ name: 'diff_summary', type: 'text', nullable: true })
  diffSummary: string | null;
}
