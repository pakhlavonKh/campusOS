import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, Permission, RolePermission, MembershipRole, AbacPolicy } from './entities/rbac.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission, MembershipRole, AbacPolicy])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class RbacModule {}
