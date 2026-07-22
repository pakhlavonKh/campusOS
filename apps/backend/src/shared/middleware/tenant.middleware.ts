import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { tenantStorage } from '../subscribers/tenant-context.subscriber';

/**
 * TenantMiddleware
 *
 * Extracts organizationId from the validated JWT and stores it in
 * AsyncLocalStorage so TenantContextSubscriber can set the PostgreSQL
 * RLS session variable on every query.
 *
 * Runs before every request (registered globally in AppModule).
 * Must run AFTER AuthGuard has validated the token.
 *
 * GAP-SEC-01: SRS §20.2, SDD §24.2.1
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers?.authorization;
    let organizationId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.decode(token) as Record<string, any>;
        organizationId = payload?.organizationId ?? null;
      } catch {
        // Token invalid — let AuthGuard handle the rejection
      }
    }

    tenantStorage.run({ organizationId }, () => next());
  }
}
