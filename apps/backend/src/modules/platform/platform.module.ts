import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformController } from './controllers/platform.controller';
import { PlatformService } from './services/platform.service';
import { Organization } from '../organizations/entities/organization.entity';
import { AuditModule } from '../audit/audit.module';

/**
 * PlatformModule — provides services and controllers for Platform Super Admin platform/v1 scope.
 * SDD §3.2.3.2 and §14.0.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    AuditModule,
  ],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
