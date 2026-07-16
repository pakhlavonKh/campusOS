import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort, Group, GroupMember } from './entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cohort, Group, GroupMember])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class GroupsModule {}
