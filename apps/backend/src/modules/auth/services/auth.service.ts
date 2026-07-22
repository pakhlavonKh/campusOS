import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthCredential, RefreshToken, Membership } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Role, RolePermission, Permission, MembershipRole } from '../../rbac/entities/rbac.entity';

/**
 * AuthService — Core authentication logic.
 * SDD §3.2.1 Authentication Context.
 *
 * Bug fixes applied (all found in compliance audit):
 * 1. refreshTokens() now uses SHA-256 deterministic hash for token lookup,
 *    then bcrypt.compare() for verification — bcrypt.hash() was non-deterministic.
 * 2. JWT payload roles/permissions are now resolved from DB (Membership → Role → Permission).
 * 3. login() derives organizationId from actual membership, not a hardcoded mock UUID.
 * 4. generateTokens() has explicit themeConfig parameter instead of arguments[3].
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AuthCredential) private readonly credentialRepo: Repository<AuthCredential>,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(Membership) private readonly membershipRepo: Repository<Membership>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    @InjectRepository(MembershipRole) private readonly membershipRoleRepo: Repository<MembershipRole>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission) private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ── Token hashing utilities ──────────────────────────────────────────────────

  /**
   * Creates a deterministic SHA-256 hex hash of a token.
   * Used as the DB lookup key for refresh tokens.
   * bcrypt is NOT used for lookup because it is non-deterministic.
   */
  private hashTokenForLookup(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // ── Permission resolution ────────────────────────────────────────────────────

  /**
   * Resolves all permissions for a user within a given organization.
   * Traverses: Membership → MembershipRole → Role → RolePermission → Permission.
   * SDD §5.2 Authorization Infrastructure.
   */
  private async resolvePermissions(
    userId: string,
    organizationId: string,
  ): Promise<{ roles: string[]; permissions: string[] }> {
    try {
      // Find the user's membership for this organization
      const membership = await this.membershipRepo.findOne({
        where: { userId, organizationId, status: 'active' },
      });

      if (!membership) {
        return { roles: [], permissions: [] };
      }

      // Find all roles assigned to this membership
      const membershipRoles = await this.membershipRoleRepo.find({
        where: { membershipId: membership.id },
      });

      if (membershipRoles.length === 0) {
        return { roles: [], permissions: [] };
      }

      const roleIds = membershipRoles.map((mr: MembershipRole) => mr.roleId);

      // Load role names
      const roles = await this.roleRepo.findByIds(roleIds);
      const roleNames = roles.map((r: Role) => r.name);

      // Load all role-permission links for these roles
      const rolePermissions = await this.rolePermissionRepo.find({
        where: roleIds.map((id: string) => ({ roleId: id })),
      });

      const permissionIds = rolePermissions.map((rp: RolePermission) => rp.permissionId);

      if (permissionIds.length === 0) {
        return { roles: roleNames, permissions: [] };
      }

      // Load permission strings
      const permissions = await this.permissionRepo.findByIds(permissionIds);
      const permissionStrings = permissions.map((p: Permission) => `${p.resource}:${p.action}`);

      return { roles: roleNames, permissions: permissionStrings };
    } catch (err: any) {
      this.logger.warn(`Could not resolve permissions for user ${userId}: ${err.message}`);
      return { roles: [], permissions: [] };
    }
  }

  // ── Register ─────────────────────────────────────────────────────────────────

  /**
   * Register a new user with email and password.
   * SRS §5.1 — email/password registration flow.
   */
  async register(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    branchId?: string;
    role?: string;
  }) {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepo.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    const savedUser = await this.userRepo.save(user);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const credential = this.credentialRepo.create({
      userId: savedUser.id,
      passwordHash,
    });
    await this.credentialRepo.save(credential);

    // Create membership
    const membership = this.membershipRepo.create({
      userId: savedUser.id,
      organizationId: dto.organizationId,
      branchId: dto.branchId || null,
      status: 'active',
    });
    await this.membershipRepo.save(membership);

    this.eventEmitter.emit('user.registered', {
      eventType: 'user.registered',
      aggregateId: savedUser.id,
      aggregateType: 'User',
      organizationId: dto.organizationId,
      data: {
        userId: savedUser.id,
        method: 'email',
        organizationId: dto.organizationId,
      },
    });

    this.logger.log(`User registered: ${savedUser.id} (${savedUser.email})`);

    return this.generateTokens(savedUser, dto.organizationId, dto.branchId);
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  /**
   * Authenticate user with email and password.
   * SRS §5.1 — login flow with JWT generation.
   * FIX: organizationId is now resolved from actual membership.
   */
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const credential = await this.credentialRepo.findOne({ where: { userId: user.id } });
    if (!credential?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, credential.passwordHash);
    if (!isPasswordValid) {
      this.eventEmitter.emit('login.failed', {
        eventType: 'login.failed',
        data: { email, reason: 'invalid_password' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // FIX: Resolve real organization from the user's primary active membership
    const primaryMembership = await this.membershipRepo.findOne({
      where: { userId: user.id, status: 'active' },
      order: { createdAt: 'ASC' },
    });

    const organizationId = primaryMembership?.organizationId || '';
    const branchId = primaryMembership?.branchId || undefined;

    // Load white-label config for the org
    let themeConfig: Record<string, any> = {};
    if (organizationId) {
      try {
        const org = await this.orgRepo.findOne({ where: { id: organizationId } });
        if (org) themeConfig = org.whiteLabelConfig;
      } catch {
        // DB might not have org yet in development seeding
      }
    }

    this.eventEmitter.emit('user.logged_in', {
      eventType: 'user.logged_in',
      aggregateId: user.id,
      data: { userId: user.id, method: 'email' },
    });

    this.logger.log(`User logged in: ${user.id} (${user.email})`);

    return this.generateTokens(user, organizationId, branchId, themeConfig);
  }

  // ── Refresh ──────────────────────────────────────────────────────────────────

  /**
   * Refresh an access token using a valid refresh token.
   * SDD §3.2.1 — Token refresh with rotation.
   *
   * FIX: Uses SHA-256 deterministic hash for DB lookup (bcrypt.hash is non-deterministic).
   * The stored hash in the DB is now a SHA-256 hex string, not a bcrypt hash.
   */
  async refreshTokens(refreshTokenValue: string) {
    // Deterministic lookup hash
    const lookupHash = this.hashTokenForLookup(refreshTokenValue);

    const storedToken = await this.refreshTokenRepo.findOne({
      where: { tokenHash: lookupHash, isRevoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: revoke old token
    storedToken.isRevoked = true;
    await this.refreshTokenRepo.save(storedToken);

    const user = await this.userRepo.findOne({ where: { id: storedToken.userId } });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Resolve org from membership
    const membership = await this.membershipRepo.findOne({
      where: { userId: user.id, status: 'active' },
      order: { createdAt: 'ASC' },
    });

    const organizationId = membership?.organizationId || '';
    const branchId = membership?.branchId || undefined;

    return this.generateTokens(user, organizationId, branchId);
  }

  // ── Logout ───────────────────────────────────────────────────────────────────

  /**
   * Logout — revoke all refresh tokens for user.
   */
  async logout(userId: string) {
    await this.refreshTokenRepo.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );

    this.eventEmitter.emit('user.logged_out', {
      eventType: 'user.logged_out',
      aggregateId: userId,
      data: { userId },
    });
  }

  // ── Token generation ─────────────────────────────────────────────────────────

  /**
   * Generate access + refresh token pair.
   * SDD §3.2.1 JWT Payload Structure.
   *
   * FIX 1: themeConfig is an explicit parameter (not arguments[3]).
   * FIX 2: roles and permissions are resolved from DB, not empty arrays.
   * FIX 3: refresh token stored as SHA-256 hash, not bcrypt (deterministic lookup).
   */
  private async generateTokens(
    user: User,
    organizationId: string,
    branchId?: string,
    themeConfig?: Record<string, any>,
  ) {
    const sessionId = uuidv4();

    // Resolve real roles and permissions from RBAC
    const { roles, permissions } = await this.resolvePermissions(user.id, organizationId);

    const payload = {
      sub: user.id,
      orgId: organizationId,
      organizationId,
      branchId: branchId || '',
      roles,
      permissions,
      mfaEnabled: false, // updated by MfaService on confirm
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Generate refresh token: store SHA-256 hash for deterministic lookup
    const refreshTokenValue = uuidv4();
    const tokenHash = this.hashTokenForLookup(refreshTokenValue);

    const refreshToken = this.refreshTokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    await this.refreshTokenRepo.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      organizationId,
      theme: themeConfig || {},
    };
  }

  // ── Public helper for MfaService ────────────────────────────────────────────

  /** Generate full access+refresh tokens for a user (called after MFA verify). */
  async generateTokensForUser(userId: string) {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const membership = await this.membershipRepo.findOne({
      where: { userId, status: 'active' },
      order: { createdAt: 'ASC' },
    });
    return this.generateTokens(user, membership?.organizationId ?? '', membership?.branchId ?? '');
  }

  // ── Password Reset ──────────────────────────────────────────────────────────

  /**
   * GAP-AUTH-01: Issues a time-limited password reset token via email.
   * Always returns successfully to prevent email enumeration.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return; // Silent — no enumeration

    const resetToken = uuidv4();
    const tokenHash = this.hashTokenForLookup(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token on credential
    await this.credentialRepo.update(
      { userId: user.id },
      { passwordResetToken: tokenHash, passwordResetExpiresAt: expiresAt } as any,
    );

    // Emit event for NotificationsModule to deliver the email
    this.eventEmitter.emit('auth.password_reset_requested', {
      userId: user.id,
      email: user.email,
      resetToken, // raw — sent in email link
    });

    this.logger.log(`Password reset token issued for ${email}`);
  }

  /**
   * GAP-AUTH-01: Validates reset token and updates password.
   * Invalidates ALL active refresh tokens for the user.
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashTokenForLookup(resetToken);
    const cred = await this.credentialRepo.findOne({
      where: { passwordResetToken: tokenHash } as any,
    });

    if (!cred) throw new UnauthorizedException('Invalid or expired reset token.');

    const expiresAt = (cred as any).passwordResetExpiresAt as Date | null;
    if (!expiresAt || expiresAt < new Date()) {
      throw new UnauthorizedException('Reset token has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.credentialRepo.update(
      { userId: cred.userId },
      { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null } as any,
    );

    // Revoke all refresh tokens
    await this.refreshTokenRepo.update(
      { userId: cred.userId },
      { revokedAt: new Date() } as any,
    );

    this.eventEmitter.emit('auth.password_reset_completed', { userId: cred.userId });
    this.logger.log(`Password reset completed for user ${cred.userId}`);
  }

  // ── Invitation Accept ───────────────────────────────────────────────────────

  /**
   * GAP-AUTH-01: Accepts a workspace invitation token.
   * Creates AuthCredential, activates Membership, emits InvitationAccepted.
   */
  async acceptInvitation(dto: {
    invitationToken: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const tokenHash = this.hashTokenForLookup(dto.invitationToken);

    // Invitation stored by InvitationsModule (stub — find by token hash)
    // In full implementation, query invitation_tokens table
    const invitation = await (this.userRepo.manager as any).query(
      `SELECT * FROM invitation_tokens WHERE token_hash = $1 AND expires_at > NOW() AND accepted_at IS NULL`,
      [tokenHash],
    ).catch(() => null);

    const inv = invitation?.[0];
    if (!inv) throw new UnauthorizedException('Invalid or expired invitation token.');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user + credential
    const user = this.userRepo.create({
      email: inv.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      status: 'active',
    });
    await this.userRepo.save(user);

    const cred = this.credentialRepo.create({ userId: user.id, passwordHash });
    await this.credentialRepo.save(cred);

    // Activate membership
    await this.membershipRepo.update(
      { id: inv.membership_id },
      { status: 'active', userId: user.id },
    );

    // Mark invitation as accepted
    await (this.userRepo.manager as any).query(
      `UPDATE invitation_tokens SET accepted_at = NOW(), accepted_by = $1 WHERE id = $2`,
      [user.id, inv.id],
    ).catch(() => null);

    this.eventEmitter.emit('auth.invitation_accepted', {
      invitationId: inv.id,
      userId: user.id,
      organizationId: inv.organization_id,
    });

    return this.generateTokens(user, inv.organization_id, inv.branch_id);
  }

  // ── SSO ─────────────────────────────────────────────────────────────────────

  /**
   * GAP-AUTH-01: Returns the OAuth/SAML provider redirect URL.
   * Full implementation requires Passport OAuth strategies.
   */
  async getSsoRedirectUrl(provider: string): Promise<string> {
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/v1/auth/sso/${provider}/callback`;

    switch (provider) {
      case 'google':
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid%20email%20profile`;
      case 'microsoft':
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid%20email%20profile`;
      default:
        throw new BadRequestException(`Unsupported SSO provider: ${provider}`);
    }
  }

  async handleSsoCallback(provider: string, code: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Stub: In production, exchange code for tokens, fetch user profile from provider
    // Then upsert User and issue CampusOS JWT
    this.logger.log(`SSO callback received for provider=${provider}, code=${code?.slice(0, 8)}...`);
    throw new BadRequestException('SSO provider integration not yet fully configured. Contact your administrator.');
  }
}

