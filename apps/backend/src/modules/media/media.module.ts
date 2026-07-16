import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaAsset, TranscodingJob, MediaThumbnail } from './entities/media.entity';
import { MediaService } from './services/media.service';
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MediaAsset, TranscodingJob, MediaThumbnail])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService, TypeOrmModule],
})
export class MediaModule {}
