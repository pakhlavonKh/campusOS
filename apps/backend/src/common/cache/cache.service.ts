import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string | undefined>('redis.password');
    const db = this.configService.get<number>('redis.db', 0);
    const keyPrefix = this.configService.get<string>('redis.keyPrefix', 'campusos:');

    this.client = new Redis({
      host,
      port,
      password,
      db,
      keyPrefix,
      maxRetriesPerRequest: null,
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis server');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await this.client.get(key);
      if (!val) return null;
      return JSON.parse(val) as T;
    } catch (err: any) {
      this.logger.warn(`Failed to GET key "${key}" from Redis: ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const str = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, str, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, str);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to SET key "${key}" in Redis: ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.warn(`Failed to DEL key "${key}" from Redis: ${err.message}`);
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
      this.logger.log('Disconnected from Redis server');
    }
  }
}
