import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * MfaRequiredGuard
 *
 * Enforces mandatory MFA for privileged roles.
 * Throws HTTP 403 { code: 'MFA_REQUIRED' } if:
 *  - User holds platform_super_admin, org_admin, or branch_admin role
 *  - AND user.mfaEnabled is false in the JWT payload
 *
 * Register as a global guard AFTER AuthGuard, BEFORE RbacGuard.
 *
 * GAP-AUTH-02: SRS §20.1, SDD §24.1.3
 */

const MFA_MANDATORY_ROLES = ['platform_super_admin', 'org_admin', 'branch_admin'];

/** Decorator to skip MFA check on specific endpoints (e.g., /auth/mfa/setup) */
export const SKIP_MFA_KEY = 'skipMfa';
export const SkipMfa = () =>
  (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(SKIP_MFA_KEY, true, descriptor.value);
    } else {
      Reflect.defineMetadata(SKIP_MFA_KEY, true, target);
    }
  };

@Injectable()
export class MfaRequiredGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Allow endpoints decorated with @SkipMfa()
    const skipMfa = this.reflector.getAllAndOverride<boolean>(SKIP_MFA_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (skipMfa) return true;

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // No authenticated user — let AuthGuard handle it
    if (!user) return true;

    const userRoles: string[] = user.roles ?? [];
    const needsMfa = userRoles.some((r) => MFA_MANDATORY_ROLES.includes(r));

    if (needsMfa && !user.mfaEnabled) {
      throw new ForbiddenException({
        code: 'MFA_REQUIRED',
        message:
          'Multi-factor authentication is required for your role. ' +
          'Please enable MFA at /auth/mfa/setup before continuing.',
      });
    }

    return true;
  }
}
