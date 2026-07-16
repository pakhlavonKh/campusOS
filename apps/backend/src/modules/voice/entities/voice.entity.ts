import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/** SpeechProvider — provider definition (Azure, Google, Deepgram, AssemblyAI). SDD §3.2.17. */
@Entity('speech_providers')
@Index(['organizationId', 'providerKey'], { unique: true })
export class SpeechProvider extends BaseEntity {
  @Column({ name: 'provider_key', type: 'varchar', length: 50 })
  providerKey: 'azure' | 'google' | 'deepgram' | 'assembly_ai' | 'whisper';

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'supported_languages', type: 'text', array: true, default: '{}' })
  supportedLanguages: string[];
}

/** SpeechProviderConfig — per-tenant provider configuration and encrypted API keys. */
@Entity('speech_provider_configs')
@Index(['organizationId', 'providerId'], { unique: true })
export class SpeechProviderConfig extends BaseEntity {
  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @Column({ name: 'api_key_encrypted', type: 'text' })
  apiKeyEncrypted: string;

  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

/** SpeakingAssignment — graded speaking task with prompt and rubric. SRS §5.22.2. */
@Entity('speaking_assignments')
@Index(['courseId', 'organizationId'])
export class SpeakingAssignment extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lessonId: string | null;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ name: 'target_language', type: 'varchar', length: 10, default: 'en' })
  targetLanguage: string;

  @Column({ name: 'max_duration_seconds', type: 'int', nullable: true })
  maxDurationSeconds: number | null;

  @Column({ name: 'max_attempts', type: 'int', default: 3 })
  maxAttempts: number;

  @Column({ name: 'rubric_id', type: 'uuid', nullable: true })
  rubricId: string | null;
}

/** SpeechRecording — uploaded audio file reference. SRS §5.22.1. */
@Entity('speech_recordings')
@Index(['studentId', 'assignmentId'])
export class SpeechRecording extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'assignment_id', type: 'uuid', nullable: true })
  assignmentId: string | null;

  @Column({ name: 's3_key', type: 'varchar', length: 512 })
  s3Key: string;

  @Column({ name: 'cdn_url', type: 'text', nullable: true })
  cdnUrl: string | null;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ name: 'file_size_bytes', type: 'bigint', nullable: true })
  fileSizeBytes: number | null;

  @Column({ name: 'mime_type', type: 'varchar', length: 50 })
  mimeType: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'processing' | 'ready' | 'failed';
}

/** PronunciationResult — AI-scored result per recording. SRS §5.22.1. */
@Entity('pronunciation_results')
@Index(['recordingId'], { unique: true })
export class PronunciationResult extends BaseEntity {
  @Column({ name: 'recording_id', type: 'uuid' })
  recordingId: string;

  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @Column({ name: 'overall_score', type: 'decimal', precision: 5, scale: 2 })
  overallScore: number;

  @Column({ name: 'transcribed_text', type: 'text', nullable: true })
  transcribedText: string | null;

  /** Raw provider response stored for reprocessing */
  @Column({ name: 'raw_result', type: 'jsonb', default: '{}' })
  rawResult: Record<string, any>;
}

/** PronunciationScore — detailed sub-scores per result. SRS §5.22.1. */
@Entity('pronunciation_scores')
@Index(['resultId'])
export class PronunciationScore extends BaseEntity {
  @Column({ name: 'result_id', type: 'uuid' })
  resultId: string;

  @Column({ type: 'varchar', length: 50 })
  scoreType: 'fluency' | 'completeness' | 'pronunciation' | 'prosody' | 'vocabulary';

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ name: 'max_score', type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  /** Word-level feedback [{word, phoneme, score, feedback}] */
  @Column({ type: 'jsonb', default: '[]' })
  details: Array<Record<string, any>>;
}

/** OralExam — oral examination session. SRS §5.22.3. */
@Entity('oral_exams')
@Index(['courseId', 'organizationId'])
export class OralExam extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number | null;

  @Column({ name: 'rubric_id', type: 'uuid', nullable: true })
  rubricId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'completed';
}
