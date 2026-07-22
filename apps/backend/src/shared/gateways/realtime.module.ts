import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeGateway } from './realtime.gateway';

/**
 * RealtimeModule
 *
 * Registers the WebSocket gateway. Import in AppModule.
 * Services that need to emit real-time events inject RealtimeGateway directly.
 *
 * GAP-SVC-07: SRS §20.4, SDD §24.4.2
 */
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
    }),
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
