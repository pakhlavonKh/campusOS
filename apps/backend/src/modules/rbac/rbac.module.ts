import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, Permission, RolePermission, MembershipRole, AbacPolicy } from './entities/rbac.entity';
import { RbacService } from './services/rbac.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission, MembershipRole, AbacPolicy])],
  controllers: [],
  providers: [RbacService],
  exports: [TypeOrmModule, RbacService],
})
export class RbacModule {}

