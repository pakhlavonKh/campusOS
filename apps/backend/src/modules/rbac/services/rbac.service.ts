import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, Permission, RolePermission, MembershipRole, AbacPolicy } from '../entities/rbac.entity';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(MembershipRole)
    private readonly membershipRoleRepo: Repository<MembershipRole>,
    @InjectRepository(AbacPolicy)
    private readonly abacPolicyRepo: Repository<AbacPolicy>,
  ) {}

  /**
   * Get all system-level and tenant-level roles.
   */
  async getRoles(organizationId?: string): Promise<Role[]> {
    const where: any[] = [{ isSystem: true }];
    if (organizationId) {
      where.push({ organizationId });
    }
    return this.roleRepo.find({ where });
  }

  /**
   * Create a new role.
   */
  async createRole(data: {
    name: string;
    description?: string;
    organizationId?: string;
    isSystem?: boolean;
  }): Promise<Role> {
    const existing = await this.roleRepo.findOne({
      where: { name: data.name, organizationId: data.organizationId || null },
    });
    if (existing) {
      throw new ConflictException(`Role with name ${data.name} already exists.`);
    }

    const role = this.roleRepo.create({
      name: data.name,
      description: data.description || null,
      organizationId: data.organizationId || null,
      isSystem: data.isSystem || false,
    });

    return this.roleRepo.save(role);
  }

  /**
   * Assign permissions to a role.
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found.`);
    }

    // Load permissions to make sure they exist
    const permissions = await this.permissionRepo.find({
      where: { id: In(permissionIds) },
    });
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('Some permission IDs are invalid.');
    }

    // Delete existing assignments for simplicity
    await this.rolePermissionRepo.delete({ roleId });

    // Create new assignments
    const rolePermissions = permissionIds.map((permId) =>
      this.rolePermissionRepo.create({ roleId, permissionId: permId }),
    );
    await this.rolePermissionRepo.save(rolePermissions);
  }

  /**
   * Assign a role to a membership.
   */
  async assignRoleToMembership(membershipId: string, roleId: string): Promise<MembershipRole> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found.`);
    }

    const existing = await this.membershipRoleRepo.findOne({
      where: { membershipId, roleId },
    });
    if (existing) {
      return existing;
    }

    const mr = this.membershipRoleRepo.create({ membershipId, roleId });
    return this.membershipRoleRepo.save(mr);
  }

  /**
   * Remove a role from a membership.
   */
  async removeRoleFromMembership(membershipId: string, roleId: string): Promise<void> {
    await this.membershipRoleRepo.delete({ membershipId, roleId });
  }

  /**
   * Load permissions associated with a membership.
   */
  async resolvePermissionsForMembership(membershipId: string): Promise<{ roles: string[]; permissions: string[] }> {
    const membershipRoles = await this.membershipRoleRepo.find({
      where: { membershipId },
    });
    if (membershipRoles.length === 0) {
      return { roles: [], permissions: [] };
    }

    const roleIds = membershipRoles.map((mr) => mr.roleId);
    const roles = await this.roleRepo.find({ where: { id: In(roleIds) } });
    const roleNames = roles.map((r) => r.name);

    const rolePermissions = await this.rolePermissionRepo.find({
      where: { roleId: In(roleIds) },
    });
    const permissionIds = rolePermissions.map((rp) => rp.permissionId);

    if (permissionIds.length === 0) {
      return { roles: roleNames, permissions: [] };
    }

    const permissions = await this.permissionRepo.find({ where: { id: In(permissionIds) } });
    const permissionStrings = permissions.map((p) => `${p.resource}:${p.action}`);

    return { roles: roleNames, permissions: permissionStrings };
  }

  /**
   * Get all defined permissions in the system.
   */
  async getPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  /**
   * CRUD for ABAC Policies
   */
  async createAbacPolicy(policyData: {
    effect: 'ALLOW' | 'DENY';
    resource: string;
    condition: { type: string; subject: string; object: string; operator: string };
    organizationId?: string;
  }): Promise<AbacPolicy> {
    const policy = this.abacPolicyRepo.create({
      effect: policyData.effect,
      resource: policyData.resource,
      condition: policyData.condition,
      organizationId: policyData.organizationId || null,
      active: true,
    });
    return this.abacPolicyRepo.save(policy);
  }

  async getAbacPolicies(organizationId?: string): Promise<AbacPolicy[]> {
    const where: any[] = [{ organizationId: null }];
    if (organizationId) {
      where.push({ organizationId });
    }
    return this.abacPolicyRepo.find({ where });
  }
}
