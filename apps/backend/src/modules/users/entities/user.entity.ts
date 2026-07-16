import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { PlatformEntity } from '../../../shared/entities/base.entity';

/**
 * Core user record — SDD §3.2.2.
 * Users are platform-level (not tenant-scoped). Tenant association
 * comes through Membership entities.
 */
@Entity('users')
export class User extends PlatformEntity {
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'suspended' | 'archived';

  @Column({ type: 'varchar', length: 10, default: 'en' })
  locale: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  // Computed property
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

/**
 * Auth credentials stored separately from user profile — SDD §3.2.1.
 */
@Entity('auth_credentials')
export class AuthCredential extends PlatformEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ name: 'oauth_provider', type: 'varchar', length: 50, nullable: true })
  oauthProvider: string | null;

  @Column({ name: 'oauth_id', type: 'varchar', length: 255, nullable: true })
  oauthId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

/**
 * Refresh tokens — SDD §5.1 JWT Architecture.
 * Rotated on each use; old tokens are invalidated.
 */
@Entity('refresh_tokens')
export class RefreshToken extends PlatformEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash: string;

  @Column({ name: 'device_info', type: 'varchar', length: 255, nullable: true })
  deviceInfo: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

/**
 * Membership — Links users to organizations and branches with roles.
 * SDD §3.2.2.
 */
@Entity('memberships')
export class Membership extends PlatformEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: 'active' | 'suspended' | 'inactive';

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

/**
 * Parent-child link — SRS §5.5.
 */
@Entity('parent_links')
export class ParentLink extends PlatformEntity {
  @Column({ name: 'parent_id', type: 'uuid' })
  parentId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;
}

/**
 * MFAConfig — MFA method configuration per user.
 * SDD §3.2.1 — supports TOTP and SMS-based MFA.
 */
@Entity('mfa_configs')
export class MFAConfig extends PlatformEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  method: 'totp' | 'sms';

  @Column({ name: 'totp_secret', type: 'varchar', length: 255, nullable: true })
  totpSecret: string | null;

  @Column({ name: 'backup_codes', type: 'jsonb', default: '[]' })
  backupCodes: string[];

  @Column({ name: 'is_enabled', type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

/**
 * AuthSession — Active session per device/browser.
 * SDD §3.2.1 — allows session listing and revocation.
 */
@Entity('auth_sessions')
@Index(['userId', 'isActive'])
export class AuthSession extends PlatformEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'session_id', type: 'varchar', length: 36, unique: true })
  sessionId: string;

  @Column({ name: 'device_info', type: 'varchar', length: 255, nullable: true })
  deviceInfo: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'last_active_at', type: 'timestamptz', default: () => 'NOW()' })
  lastActiveAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

/**
 * LoginAttempt — Brute-force detection log.
 * SDD §3.2.1 — records every login attempt for rate limiting.
 */
@Entity('login_attempts')
@Index(['email', 'createdAt'])
@Index(['ipAddress', 'createdAt'])
export class LoginAttempt {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ name: 'failure_reason', type: 'varchar', length: 100, nullable: true })
  failureReason: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;
}

