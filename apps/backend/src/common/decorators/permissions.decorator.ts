import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required permissions for a controller method.
 * Used with RBACGuard per SDD §5.2.
 *
 * @example
 * @Permissions('course:create', 'course:update')
 */
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to specify required feature flags for a controller method.
 * Used with FeatureFlagGuard per SDD §5.3.
 *
 * @example
 * @FeatureFlags('module:gamification')
 */
export const FEATURE_FLAGS_KEY = 'feature-flags';
export const FeatureFlags = (...flags: string[]) =>
  SetMetadata(FEATURE_FLAGS_KEY, flags);

/**
 * Decorator to mark an endpoint as requiring audit logging.
 */
export const AUDIT_KEY = 'audit';
export const Audit = (resourceType: string) =>
  SetMetadata(AUDIT_KEY, resourceType);
