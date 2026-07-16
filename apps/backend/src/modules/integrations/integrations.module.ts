import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationApp, OrganizationIntegration } from './entities/integration.entity';
import { IntegrationsService } from './services/integrations.service';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationApp, OrganizationIntegration])],
  controllers: [],
  providers: [IntegrationsService],
  exports: [IntegrationsService, TypeOrmModule],
})
export class IntegrationsModule {}
