import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, Branch, FeatureFlag, Room } from './entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Branch, FeatureFlag, Room])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class OrganizationsModule {}
