import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement, Forum, Thread, Post } from './entities/collaboration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement, Forum, Thread, Post])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class CollaborationModule {}
