import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../ormconfig';
import { Role, Permission, RolePermission } from '../../modules/rbac/entities/rbac.entity';
import { User, AuthCredential } from '../../modules/users/entities/user.entity';
import { Membership } from '../../modules/users/entities/membership.entity';
import { ParentLink } from '../../modules/users/entities/parent-link.entity';
import { Organization } from '../../modules/organizations/entities/organization.entity';
import { Branch } from '../../modules/branches/entities/branch.entity';
import { SYSTEM_ROLES, DEFAULT_ROLE_PERMISSIONS } from '@campusos/shared';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const logger = new Logger('Seed');

async function run() {
  logger.log('Connecting to database...');
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  logger.log('Database connected.');

  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);
  const orgRepo = dataSource.getRepository(Organization);
  const branchRepo = dataSource.getRepository(Branch);
  const userRepo = dataSource.getRepository(User);
  const authRepo = dataSource.getRepository(AuthCredential);
  const membershipRepo = dataSource.getRepository(Membership);
  const parentLinkRepo = dataSource.getRepository(ParentLink);

  logger.log('1. Seeding system roles and permissions...');

  // Create permissions from defaults
  const allPermissions = new Set<string>();
  for (const role of SYSTEM_ROLES) {
    const perms = DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];
    for (const perm of perms) {
      allPermissions.add(`${perm.resource}:${perm.action}`);
    }
  }

  const permissionMap = new Map<string, Permission>();
  for (const permStr of allPermissions) {
    const [resource, action] = permStr.split(':');
    let permission = await permissionRepo.findOne({ where: { resource, action } });
    if (!permission) {
      permission = permissionRepo.create({
        resource,
        action,
        description: `Can ${action} ${resource}`,
      });
      await permissionRepo.save(permission);
    }
    permissionMap.set(permStr, permission);
  }

  for (const roleName of SYSTEM_ROLES) {
    let role = await roleRepo.findOne({ where: { name: roleName, organizationId: null as any } });
    if (!role) {
      role = roleRepo.create({
        name: roleName,
        isSystem: true,
        description: `System role: ${roleName}`,
      });
      await roleRepo.save(role);
    }

    const perms = DEFAULT_ROLE_PERMISSIONS[roleName as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];
    for (const perm of perms) {
      const permStr = `${perm.resource}:${perm.action}`;
      const permission = permissionMap.get(permStr);
      if (permission) {
        const rp = await rolePermissionRepo.findOne({
          where: { roleId: role.id, permissionId: permission.id },
        });
        if (!rp) {
          await rolePermissionRepo.save(
            rolePermissionRepo.create({ roleId: role.id, permissionId: permission.id })
          );
        }
      }
    }
  }

  logger.log('2. Seeding default demo organization & branches...');
  let demoOrg = await orgRepo.findOne({ where: { slug: 'apex-academy' } });
  if (!demoOrg) {
    demoOrg = orgRepo.create({
      name: 'Apex Academy',
      slug: 'apex-academy',
      status: 'active',
      billingPlan: 'enterprise',
      whiteLabelConfig: {
        tier: 'token',
        tokens: { colorPrimary: '#6366f1', colorSecondary: '#10b981', fontFamily: 'Inter' },
      } as any,
    });
    await orgRepo.save(demoOrg);
  }

  let demoBranch = await branchRepo.findOne({ where: { organizationId: demoOrg.id, name: 'Main Campus' } });
  if (!demoBranch) {
    demoBranch = branchRepo.create({
      organizationId: demoOrg.id,
      name: 'Main Campus',
      code: 'MAIN',
      address: '123 University Ave, New York, NY',
      timezone: 'America/New_York',
      status: 'active',
    });
    await branchRepo.save(demoBranch);
  }

  logger.log('3. Seeding demo users, credentials & memberships...');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  const demoUsersData = [
    { email: 'admin@campusos.edu', firstName: 'Sarah', lastName: 'Connor', role: 'org_admin' },
    { email: 'teacher@campusos.edu', firstName: 'Dr. Alan', lastName: 'Smith', role: 'teacher' },
    { email: 'student@campusos.edu', firstName: 'Alex', lastName: 'Johnson', role: 'student' },
    { email: 'parent@campusos.edu', firstName: 'Maria', lastName: 'Johnson', role: 'parent' },
  ];

  const createdUsers: Record<string, User> = {};

  for (const uData of demoUsersData) {
    let user = await userRepo.findOne({ where: { email: uData.email } });
    if (!user) {
      user = userRepo.create({
        email: uData.email,
        firstName: uData.firstName,
        lastName: uData.lastName,
        status: 'active',
      });
      await userRepo.save(user);

      await authRepo.save(
        authRepo.create({
          userId: user.id,
          passwordHash: defaultPasswordHash,
        })
      );

      await membershipRepo.save(
        membershipRepo.create({
          organizationId: demoOrg.id,
          branchId: demoBranch.id,
          userId: user.id,
          role: uData.role,
          roles: [uData.role],
          status: 'active',
        })
      );
    }
    createdUsers[uData.role] = user;
  }

  // Link Parent -> Student
  if (createdUsers['parent'] && createdUsers['student']) {
    let link = await parentLinkRepo.findOne({
      where: { parentId: createdUsers['parent'].id, studentId: createdUsers['student'].id },
    });
    if (!link) {
      await parentLinkRepo.save(
        parentLinkRepo.create({
          organizationId: demoOrg.id,
          parentId: createdUsers['parent'].id,
          studentId: createdUsers['student'].id,
          relationship: 'mother',
          isPrimaryContact: true,
        })
      );
    }
  }

  logger.log('Seeding completed successfully!');
  await dataSource.destroy();
}

run().catch((error) => {
  logger.error('Error during seeding', error);
  process.exit(1);
});
