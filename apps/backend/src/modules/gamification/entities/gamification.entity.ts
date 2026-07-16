import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

// ═══════════════════════════════════════════════════════════════════════════════
// BADGES & ACHIEVEMENTS  (SRS §5.21.1)
// ═══════════════════════════════════════════════════════════════════════════════

/** Badge — award definition. SRS §5.21.1. */
@Entity('badges')
@Index(['organizationId'])
export class Badge extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'icon_url', type: 'text', nullable: true })
  iconUrl: string | null;

  /** Criteria for automatic award (JSONB rule evaluated by automation engine) */
  @Column({ type: 'jsonb', default: '{}' })
  criteria: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

/** BadgeAward — awarded badge instance per user. SRS §5.21.1. Auditable. */
@Entity('badge_awards')
@Index(['userId', 'badgeId'])
export class BadgeAward extends BaseEntity {
  @Column({ name: 'badge_id', type: 'uuid' })
  badgeId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'awarded_at', type: 'timestamptz', default: () => 'NOW()' })
  awardedAt: Date;

  /** Trigger context for auditing (e.g., {event: 'course.completed', courseId: '...'}) */
  @Column({ type: 'jsonb', default: '{}' })
  context: Record<string, any>;
}

/** Achievement — multi-step achievement with progress tracking. SRS §5.21.1. */
@Entity('achievements')
@Index(['organizationId'])
export class Achievement extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'icon_url', type: 'text', nullable: true })
  iconUrl: string | null;

  @Column({ name: 'total_steps', type: 'int', default: 1 })
  totalSteps: number;

  /** XP awarded on completion */
  @Column({ name: 'xp_reward', type: 'int', default: 0 })
  xpReward: number;
}

/** AchievementProgress — user progress toward achievement steps. */
@Entity('achievement_progress')
@Index(['userId', 'achievementId'], { unique: true })
export class AchievementProgress extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'achievement_id', type: 'uuid' })
  achievementId: string;

  @Column({ name: 'current_step', type: 'int', default: 0 })
  currentStep: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// XP & POINTS  (SRS §5.21.1)
// ═══════════════════════════════════════════════════════════════════════════════

/** XPRecord — XP awarded per action per user. */
@Entity('xp_records')
@Index(['userId', 'organizationId'])
export class XPRecord extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ name: 'action_type', type: 'varchar', length: 100 })
  actionType: string; // e.g., 'lesson.completed', 'quiz.perfect_score'

  @Column({ name: 'source_id', type: 'uuid', nullable: true })
  sourceId: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  context: Record<string, any>;
}

/** PointRecord — organization-defined points (distinct from XP). SRS §5.21.1. */
@Entity('point_records')
@Index(['userId', 'organizationId'])
export class PointRecord extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ name: 'action_type', type: 'varchar', length: 100 })
  actionType: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARDS  (SRS §5.21.1)
// ═══════════════════════════════════════════════════════════════════════════════

/** Leaderboard — definition for a ranked leaderboard. SRS §5.21.1. */
@Entity('leaderboards')
@Index(['organizationId'])
export class Leaderboard extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 30 })
  scope: 'class' | 'course' | 'branch' | 'organization';

  @Column({ name: 'scope_id', type: 'uuid', nullable: true })
  scopeId: string | null;

  @Column({ name: 'metric', type: 'varchar', length: 30, default: 'xp' })
  metric: 'xp' | 'points' | 'lessons_completed' | 'streak';

  @Column({ name: 'is_opt_in', type: 'boolean', default: false })
  isOptIn: boolean;

  @Column({ name: 'reset_period', type: 'varchar', length: 20, nullable: true })
  resetPeriod: 'weekly' | 'monthly' | 'term' | null;

  @Column({ name: 'last_reset_at', type: 'timestamptz', nullable: true })
  lastResetAt: Date | null;
}

/** LeaderboardEntry — ranked entry per user. Updated periodically. */
@Entity('leaderboard_entries')
@Index(['leaderboardId', 'rank'])
@Index(['userId', 'leaderboardId'], { unique: true })
export class LeaderboardEntry extends BaseEntity {
  @Column({ name: 'leaderboard_id', type: 'uuid' })
  leaderboardId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'bigint' })
  score: number;

  @Column({ name: 'previous_rank', type: 'int', nullable: true })
  previousRank: number | null;

  @Column({ name: 'is_opted_in', type: 'boolean', default: true })
  isOptedIn: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STREAKS & CHALLENGES  (SRS §5.21.2)
// ═══════════════════════════════════════════════════════════════════════════════

/** Streak — daily/weekly streak tracking per user. SRS §5.21.2. */
@Entity('streaks')
@Index(['userId', 'organizationId'])
export class Streak extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'streak_type', type: 'varchar', length: 20 })
  streakType: 'daily' | 'weekly';

  @Column({ name: 'current_count', type: 'int', default: 0 })
  currentCount: number;

  @Column({ name: 'longest_count', type: 'int', default: 0 })
  longestCount: number;

  @Column({ name: 'last_activity_date', type: 'date', nullable: true })
  lastActivityDate: string | null;

  @Column({ name: 'frozen_until', type: 'date', nullable: true })
  frozenUntil: string | null;
}

/** LearningChallenge — time-limited challenge with goals and rewards. SRS §5.21.2. */
@Entity('learning_challenges')
@Index(['organizationId'])
export class LearningChallenge extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date;

  /** Goal definition JSONB: {type: 'complete_lessons', count: 5} */
  @Column({ type: 'jsonb' })
  goal: Record<string, any>;

  @Column({ name: 'xp_reward', type: 'int', default: 0 })
  xpReward: number;

  @Column({ name: 'badge_id', type: 'uuid', nullable: true })
  badgeId: string | null;
}

/** LearningChallengeProgress — user progress on a challenge. */
@Entity('learning_challenge_progress')
@Index(['userId', 'challengeId'], { unique: true })
export class LearningChallengeProgress extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'challenge_id', type: 'uuid' })
  challengeId: string;

  @Column({ name: 'current_value', type: 'int', default: 0 })
  currentValue: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'reward_claimed', type: 'boolean', default: false })
  rewardClaimed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CERTIFICATES & REWARDS  (SRS §5.21.3)
// ═══════════════════════════════════════════════════════════════════════════════

/** CertificateTemplate — branded template per org. SRS §5.21.3, §6.15. */
@Entity('certificate_templates')
@Index(['organizationId'])
export class CertificateTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'template_type', type: 'varchar', length: 30, default: 'course_completion' })
  templateType: 'course_completion' | 'program_completion' | 'achievement' | 'custom';

  /** HTML/CSS template or S3 path to PDF template */
  @Column({ name: 'template_data', type: 'jsonb' })
  templateData: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

/**
 * Certificate — issued certificate with unique ID + QR code.
 * SRS §5.21.3, §6.15 — tamper-evident, publicly verifiable.
 */
@Entity('certificates')
@Index(['userId', 'organizationId'])
@Index(['verificationCode'], { unique: true })
export class Certificate extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @Column({ name: 'source_type', type: 'varchar', length: 30 })
  sourceType: 'course' | 'program' | 'achievement' | 'challenge';

  @Column({ name: 'source_id', type: 'uuid' })
  sourceId: string;

  /** Unique verification code (UUID4 displayed on certificate) */
  @Column({ name: 'verification_code', type: 'varchar', length: 36, unique: true })
  verificationCode: string;

  /** QR code image S3 path */
  @Column({ name: 'qr_code_url', type: 'text', nullable: true })
  qrCodeUrl: string | null;

  /** PDF S3 path */
  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string | null;

  @Column({ name: 'issued_at', type: 'timestamptz', default: () => 'NOW()' })
  issuedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked: boolean;
}

/** Reward — redeemable reward definition. SRS §5.21.3. */
@Entity('rewards')
@Index(['organizationId'])
export class Reward extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'point_cost', type: 'int' })
  pointCost: number;

  @Column({ name: 'icon_url', type: 'text', nullable: true })
  iconUrl: string | null;

  @Column({ name: 'max_redemptions', type: 'int', nullable: true })
  maxRedemptions: number | null;

  @Column({ name: 'redemption_count', type: 'int', default: 0 })
  redemptionCount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

/** ParentReward — parent-defined reward for their child. SRS §5.21.3. */
@Entity('parent_rewards')
@Index(['parentId', 'studentId'])
export class ParentReward extends BaseEntity {
  @Column({ name: 'parent_id', type: 'uuid' })
  parentId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Trigger achievement ID that unlocks this reward */
  @Column({ name: 'trigger_achievement_id', type: 'uuid', nullable: true })
  triggerAchievementId: string | null;

  @Column({ name: 'is_claimed', type: 'boolean', default: false })
  isClaimed: boolean;

  @Column({ name: 'claimed_at', type: 'timestamptz', nullable: true })
  claimedAt: Date | null;
}
