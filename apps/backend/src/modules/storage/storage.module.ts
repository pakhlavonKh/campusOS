import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { UploadController } from './controllers/upload.controller';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
