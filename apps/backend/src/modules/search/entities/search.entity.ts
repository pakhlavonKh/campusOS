import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

/**
 * SearchIndex — tracking of search indices and synch status for OpenSearch/ElasticSearch.
 * SDD §10 Search Integration & Schema.
 */
@Entity('search_indices')
@Index(['entityType', 'entityId'], { unique: true })
@Index(['organizationId', 'lastIndexedAt'])
export class SearchIndex extends BaseEntity {
  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType!: string; // e.g., 'course', 'user', 'lesson', 'announcement'

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'last_indexed_at', type: 'timestamptz', default: () => 'NOW()' })
  lastIndexedAt!: Date;

  @Column({ type: 'varchar', length: 20, default: 'synced' })
  status!: 'synced' | 'pending_update' | 'failed';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  indexMetadata!: Record<string, any>;
}
