import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../ormconfig';
import { Role, Permission, RolePermission } from '../../modules/rbac/entities/rbac.entity';
import { SYSTEM_ROLES, DEFAULT_ROLE_PERMISSIONS } from '@campusos/shared';
import { Logger } from '@nestjs/common';

const logger = new Logger('Seed');

async function run() {
  logger.log('Connecting to database...');
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  logger.log('Database connected.');

  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);

  logger.log('Seeding roles and permissions...');

  // Create permissions from defaults
  const allPermissions = new Set<string>();
  for (const role of SYSTEM_ROLES) {
    const perms = DEFAULT_ROLE_PERMISSIONS[role as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];
    for (const perm of perms) {
      allPermissions.add(`${perm.resource}:${perm.action}`);
    }
  }

  // Ensure all permissions exist
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

  // Ensure all system roles exist and have correct permissions
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

    // Assign permissions
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
            rolePermissionRepo.create({
              roleId: role.id,
              permissionId: permission.id,
            })
          );
        }
      }
    }
  }

  logger.log('Seeding completed successfully.');
  await dataSource.destroy();
}

run().catch((error) => {
  logger.error('Error during seeding', error);
  process.exit(1);
});
