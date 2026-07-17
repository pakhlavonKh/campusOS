import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ContentPackage,
  ExportJob,
  ImportJob,
  ImportValidation,
  ContentVersion,
  ContentDiff,
} from './entities/content-portability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentPackage,
      ExportJob,
      ImportJob,
      ImportValidation,
      ContentVersion,
      ContentDiff,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class ContentPortabilityModule {}
