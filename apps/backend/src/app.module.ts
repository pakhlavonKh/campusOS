import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';

// Config
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';

// Global Cache
import { CacheModule } from './common/cache/cache.module';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BranchesModule } from './modules/branches/branches.module';
import { RbacModule } from './modules/rbac/rbac.module';

// Academic Modules
import { LmsModule } from './modules/lms/lms.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GradebookModule } from './modules/gradebook/gradebook.module';
import { GroupsModule } from './modules/groups/groups.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';

// Platform Modules
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { StorageModule } from './modules/storage/storage.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AssessmentModule } from './modules/assessment/assessment.module';

// Newly Scaffolded/Completed Compliance Modules (Tiers 3 & 4)
import { ScheduleModule } from './modules/schedule/schedule.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { VoiceModule } from './modules/voice/voice.module';
import { CrmModule } from './modules/crm/crm.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ContentPortabilityModule } from './modules/content-portability/content-portability.module';
import { SearchModule } from './modules/search/search.module';
import { MediaModule } from './modules/media/media.module';
import { AutomationModule } from './modules/automation/automation.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PlatformModule } from './modules/platform/platform.module';
import { PlatformGuard } from './common/guards/platform.guard';

// Interceptors
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      envFilePath: [
        join(__dirname, '../../../.env.local'),
        join(__dirname, '../../../.env'),
      ],
    }),

    // Event system (SDD §6.1)
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // Database (SDD §7)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.name'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('app.nodeEnv') === 'development',
        logging: configService.get<string>('app.nodeEnv') === 'development',
        ssl: configService.get<boolean>('database.ssl') ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Redis distributed message queuing (SDD §2.5 BullMQ / Bull)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host', 'localhost'),
          port: configService.get<number>('redis.port', 6379),
          password: configService.get<string | undefined>('redis.password'),
          db: configService.get<number>('redis.db', 0),
          keyPrefix: configService.get<string>('redis.keyPrefix', 'campusos:queue:'),
        },
      }),
    }),

    // Global Caching module
    CacheModule,

    // ─── Core Layer ───
    AuthModule,
    UsersModule,
    OrganizationsModule,
    BranchesModule,
    RbacModule,
    PlatformModule,

    // ─── Academic Layer ───
    LmsModule,
    AttendanceModule,
    GradebookModule,
    GroupsModule,
    CollaborationModule,

    // ─── Platform Layer ───
    MessagingModule,
    NotificationsModule,
    AuditModule,
    StorageModule,
    AnalyticsModule,
    IntegrationsModule,
    AssessmentModule,

    // ─── Compliance/Extended Layer ───
    ScheduleModule,
    GamificationModule,
    VoiceModule,
    CrmModule,
    FinanceModule,
    ContentPortabilityModule,
    SearchModule,
    MediaModule,
    AutomationModule,
    WebhooksModule,
    MarketplaceModule,
    PaymentsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: PlatformGuard,
    },
  ],
})
export class AppModule {}
