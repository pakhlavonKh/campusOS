import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User, AuthCredential } from '../../users/entities/user.entity';
import { AuthService } from './auth.service';

export interface MfaConfig {
  userId: string;
  secret: string;
  enabled: boolean;
  backupCodes: string[]; // hashed
}

/**
 * MfaService
 *
 * Handles TOTP multi-factor authentication lifecycle:
 *   - Setup (generate secret, provisioning URI, backup codes)
 *   - Confirm (validate first TOTP code before activating)
 *   - Verify during login challenge
 *   - Disable (requires password + TOTP code)
 *
 * GAP-AUTH-01, GAP-AUTH-02: SRS §20.1, SDD §24.1
 *
 * Requires: npm install speakeasy qrcode @types/speakeasy @types/qrcode
 */
@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  /** In-memory pending TOTP secrets (before confirm). Use Redis in production. */
  private readonly pendingSecrets = new Map<string, string>();

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AuthCredential) private readonly credRepo: Repository<AuthCredential>,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  // ── Setup ─────────────────────────────────────────────────────────────────

  async setupTotp(userId: string): Promise<{ provisioningUri: string; qrCode: string; backupCodes: string[] }> {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });

    const secret = speakeasy.generateSecret({
      name: `CampusOS (${user.email})`,
      issuer: 'CampusOS',
      length: 32,
    });

    // Store pending secret (not yet confirmed)
    this.pendingSecrets.set(userId, secret.base32);

    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(5).toString('hex').toUpperCase(),
    );

    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      provisioningUri: secret.otpauth_url!,
      qrCode,
      backupCodes, // Show once — user must store these
    };
  }

  async confirmTotp(userId: string, code: string): Promise<{ enabled: boolean }> {
    const pendingSecret = this.pendingSecrets.get(userId);
    if (!pendingSecret) {
      throw new BadRequestException('No pending MFA setup. Please call /auth/mfa/setup first.');
    }

    const valid = speakeasy.totp.verify({
      secret: pendingSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!valid) {
      throw new UnauthorizedException('Invalid TOTP code. Please try again.');
    }

    // Persist MFA secret on AuthCredential
    await this.credRepo.update(
      { userId },
      {
        mfaSecret: pendingSecret,
        mfaEnabled: true,
      } as any,
    );

    this.pendingSecrets.delete(userId);
    this.logger.log(`MFA enabled for user ${userId}`);

    return { enabled: true };
  }

  // ── Verify Challenge ──────────────────────────────────────────────────────

  async verifyChallenge(
    challengeToken: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(challengeToken, {
        secret: process.env.JWT_MFA_CHALLENGE_SECRET || process.env.JWT_SECRET + '_mfa',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired MFA challenge token.');
    }

    if (payload.scope !== 'mfa_challenge') {
      throw new UnauthorizedException('Invalid token scope.');
    }

    const cred = await this.credRepo.findOne({ where: { userId: payload.sub } });
    if (!cred?.mfaEnabled || !cred?.mfaSecret) {
      throw new ForbiddenException('MFA not configured for this account.');
    }

    const valid = speakeasy.totp.verify({
      secret: cred.mfaSecret as string,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!valid) {
      throw new UnauthorizedException('Invalid TOTP code.');
    }

    // Issue full access tokens
    return this.authService.generateTokensForUser(payload.sub);
  }

  // ── Disable ───────────────────────────────────────────────────────────────

  async disableTotp(userId: string, currentPassword: string, code: string): Promise<void> {
    const cred = await this.credRepo.findOne({ where: { userId } });
    if (!cred || !cred.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const passwordValid = await bcrypt.compare(currentPassword, cred.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid password.');

    if (!cred.mfaEnabled || !cred.mfaSecret) {
      throw new BadRequestException('MFA is not enabled on this account.');
    }

    const valid = speakeasy.totp.verify({
      secret: cred.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!valid) throw new UnauthorizedException('Invalid TOTP code.');

    await this.credRepo.update({ userId }, { mfaSecret: null, mfaEnabled: false });
    this.logger.log(`MFA disabled for user ${userId}`);
  }
}
