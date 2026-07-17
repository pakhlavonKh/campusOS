import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch, Room } from '../organizations/entities/organization.entity';
import { BranchesService } from './services/branches.service';
import { BranchesController } from './controllers/branches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Room])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [TypeOrmModule, BranchesService],
})
export class BranchesModule {}

