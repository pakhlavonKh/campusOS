import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Strategy for Passport — validates JWT tokens on every request.
 * SDD §5.1 JWT Architecture.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * Called after JWT is verified. Returns the payload
   * which is attached to request.user.
   */
  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      sub: payload.sub,
      orgId: payload.orgId,
      branchId: payload.branchId,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      mfa: payload.mfa || false,
      sessionId: payload.sessionId,
    };
  }
}
