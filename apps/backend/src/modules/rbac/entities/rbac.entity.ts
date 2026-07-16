import { Entity, Column, Index } from 'typeorm';
import { PlatformEntity } from '../../../shared/entities/base.entity';

/**
 * Role — named role with associated permissions.
 * SDD §3.2.5 RBAC/ABAC Context.
 */
@Entity('roles')
@Index(['name', 'organizationId'], { unique: true })
export class Role extends PlatformEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string | null;
}

/**
 * Permission — resource + action pair.
 * SDD §3.2.5.
 */
@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission extends PlatformEntity {
  @Column({ type: 'varchar', length: 100 })
  resource: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}

/**
 * Role ↔ Permission many-to-many junction.
 */
@Entity('role_permissions')
@Index(['roleId', 'permissionId'], { unique: true })
export class RolePermission {
  @Column({ name: 'role_id', type: 'uuid', primary: true })
  roleId: string;

  @Column({ name: 'permission_id', type: 'uuid', primary: true })
  permissionId: string;
}

/**
 * Membership ↔ Role many-to-many junction.
 */
@Entity('membership_roles')
@Index(['membershipId', 'roleId'], { unique: true })
export class MembershipRole {
  @Column({ name: 'membership_id', type: 'uuid', primary: true })
  membershipId: string;

  @Column({ name: 'role_id', type: 'uuid', primary: true })
  roleId: string;
}

/**
 * ABAC Policy — attribute-based access control rule.
 * SDD §3.2.5.
 */
@Entity('abac_policies')
export class AbacPolicy extends PlatformEntity {
  @Column({ type: 'varchar', length: 10 })
  effect: 'ALLOW' | 'DENY';

  @Column({ type: 'varchar', length: 100 })
  resource: string;

  @Column({ type: 'jsonb' })
  condition: {
    type: string;
    subject: string;
    object: string;
    operator: string;
  };

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
