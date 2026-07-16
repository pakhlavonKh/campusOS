import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchIndex } from '../entities/search.entity';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(SearchIndex) private readonly searchIndexRepo: Repository<SearchIndex>,
  ) {}

  async indexEntity(organizationId: string, entityType: string, entityId: string, data: Record<string, any>) {
    this.logger.log(`Indexing entity ${entityType}:${entityId} for organization ${organizationId}`);

    let index = await this.searchIndexRepo.findOne({ where: { entityType, entityId, organizationId } });

    if (!index) {
      index = this.searchIndexRepo.create({
        organizationId,
        entityType,
        entityId,
        status: 'synced',
        lastIndexedAt: new Date(),
        indexMetadata: data,
      });
    } else {
      index.status = 'synced';
      index.lastIndexedAt = new Date();
      index.indexMetadata = data;
    }

    return this.searchIndexRepo.save(index);
  }

  async search(organizationId: string, query: string, filters?: Record<string, any>) {
    this.logger.log(`Performing search query "${query}" for organization ${organizationId}`);
    // Stub implementation interfacing with OpenSearch/ElasticSearch
    // In production, this would query an OpenSearch cluster and return hits.
    const results = await this.searchIndexRepo.find({
      where: { organizationId },
      take: 10,
    });
    return results.map((r: SearchIndex) => ({
      entityType: r.entityType,
      entityId: r.entityId,
      score: 1.0,
      fields: r.indexMetadata,
    }));
  }
}
