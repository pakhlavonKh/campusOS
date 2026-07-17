import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * PlatformGuard — secures all /platform/v1/... routes.
 * Enforces that only users with the 'platform_super_admin' role can access these endpoints.
 * SDD §14.0 Platform Super Admin Isolation.
 */
@Injectable()
export class PlatformGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    // Check if path matches /platform/v1
    const isPlatformRoute = path.startsWith('/platform/v1') || path.startsWith('platform/v1');

    if (!isPlatformRoute) {
      return true; // Not a platform route, let other guards handle it
    }

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Authentication required for platform operations');
    }

    const roles: string[] = user.roles || [];
    if (!roles.includes('platform_super_admin')) {
      throw new ForbiddenException('Access denied. Platform Super Admin role required.');
    }

    return true;
  }
}
