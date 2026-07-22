import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '@modules/auth/services/auth.service';
import { MfaService } from '@modules/auth/services/mfa.service';
import { SkipMfa } from '../../../common/guards/mfa-required.guard';
import { CurrentUser } from '../../../common/decorators/tenant.decorator';

// ── DTOs ──────────────────────────────────────────────────────────────────────

class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsUUID() organizationId: string;
  @IsUUID() @IsOptional() branchId?: string;
}

class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

class RefreshTokenDto {
  @IsString() refreshToken: string;
}

class MfaVerifyDto {
  @IsString() challengeToken: string;
  @IsString() code: string;
}

class MfaConfirmDto {
  @IsString() code: string;
}

class MfaDisableDto {
  @IsString() currentPassword: string;
  @IsString() code: string;
}

class ForgotPasswordDto {
  @IsEmail() email: string;
}

class ResetPasswordDto {
  @IsString() resetToken: string;
  @IsString() @MinLength(8) newPassword: string;
}

class InviteAcceptDto {
  @IsString() invitationToken: string;
  @IsString() @MinLength(8) password: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
}

/**
 * Auth Controller — all authentication endpoints.
 * SDD §3.2.1 Authentication Context.
 * GAP-AUTH-01: Adds MFA, password reset, invite accept, and SSO flows.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
  ) {}

  // ── Registration & Login ───────────────────────────────────────────────────

  @Post('register')
  @SkipMfa()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Post('login')
  @SkipMfa()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — returns tokens or MFA challenge' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto.email, dto.password);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Post('refresh')
  @SkipMfa()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshTokens(dto.refreshToken);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(@Req() req: any) {
    const userId = req.user?.sub;
    if (userId) await this.authService.logout(userId);
    return { success: true, data: { message: 'Logged out successfully' }, timestamp: new Date().toISOString() };
  }

  // ── MFA ────────────────────────────────────────────────────────────────────

  @Post('mfa/verify')
  @SkipMfa()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete MFA challenge — returns full tokens' })
  async mfaVerify(@Body() dto: MfaVerifyDto) {
    const result = await this.mfaService.verifyChallenge(dto.challengeToken, dto.code);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Post('mfa/setup')
  @SkipMfa()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate TOTP MFA enrollment — returns provisioning URI + backup codes' })
  async mfaSetup(@CurrentUser('sub') userId: string) {
    const result = await this.mfaService.setupTotp(userId);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Post('mfa/setup/confirm')
  @SkipMfa()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm TOTP setup by verifying first code' })
  async mfaSetupConfirm(
    @CurrentUser('sub') userId: string,
    @Body() dto: MfaConfirmDto,
  ) {
    const result = await this.mfaService.confirmTotp(userId, dto.code);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  @Post('mfa/disable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA — requires current password + valid TOTP code' })
  async mfaDisable(
    @CurrentUser('sub') userId: string,
    @Body() dto: MfaDisableDto,
  ) {
    await this.mfaService.disableTotp(userId, dto.currentPassword, dto.code);
    return { success: true, data: { mfaEnabled: false }, timestamp: new Date().toISOString() };
  }

  // ── Password Reset ─────────────────────────────────────────────────────────

  @Post('forgot-password')
  @SkipMfa()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email (always returns 200 to prevent enumeration)' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { success: true, data: { message: 'If that email is registered, a reset link has been sent.' }, timestamp: new Date().toISOString() };
  }

  @Post('reset-password')
  @SkipMfa()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using one-time token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.resetToken, dto.newPassword);
    return { success: true, data: { message: 'Password reset successfully.' }, timestamp: new Date().toISOString() };
  }

  // ── Invitation ─────────────────────────────────────────────────────────────

  @Post('invite/accept')
  @SkipMfa()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept workspace invitation — sets password and activates membership' })
  async inviteAccept(@Body() dto: InviteAcceptDto) {
    const result = await this.authService.acceptInvitation(dto);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  // ── SSO ────────────────────────────────────────────────────────────────────

  @Get('sso/:provider')
  @SkipMfa()
  @ApiOperation({ summary: 'Initiate SSO/OAuth redirect' })
  async ssoRedirect(@Param('provider') provider: string, @Res() res: any) {
    const redirectUrl = await this.authService.getSsoRedirectUrl(provider);
    return res.redirect(redirectUrl);
  }

  @Get('sso/:provider/callback')
  @SkipMfa()
  @ApiOperation({ summary: 'Handle SSO provider callback' })
  async ssoCallback(
    @Param('provider') provider: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const code = req.query.code as string;
    const result = await this.authService.handleSsoCallback(provider, code);
    // Redirect to frontend with tokens as query params (or POST redirect — client-specific)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/auth/sso/complete?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`,
    );
  }
}
