import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the current tenant context from the request.
 * The tenant context is set by the JWT payload.
 *
 * @example
 * @Get()
 * findAll(@CurrentUser() user: JwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

/**
 * Extracts the organization ID from the authenticated user.
 */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.orgId;
  },
);

/**
 * Extracts the branch ID from the authenticated user.
 */
export const BranchId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.branchId;
  },
);
