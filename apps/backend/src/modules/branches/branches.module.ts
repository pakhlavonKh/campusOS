import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch, Room } from '../organizations/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Room])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class BranchesModule {}
