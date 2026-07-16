import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchIndex } from './entities/search.entity';
import { SearchService } from './services/search.service';

@Module({
  imports: [TypeOrmModule.forFeature([SearchIndex])],
  providers: [SearchService],
  exports: [SearchService, TypeOrmModule],
})
export class SearchModule {}
