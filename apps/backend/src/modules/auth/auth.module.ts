import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// User entities
import {
  User,
  AuthCredential,
  RefreshToken,
  Membership,
  MFAConfig,
  AuthSession,
  LoginAttempt,
} from '../users/entities/user.entity';

// Auth-specific entities
import { IdentityProvider, Invitation } from './entities/identity-provider.entity';

// Organization (needed for white-label config on login)
import { Organization } from '../organizations/entities/organization.entity';

// RBAC entities (needed for permission resolution)
import { Role, RolePermission, Permission, MembershipRole } from '../rbac/entities/rbac.entity';

// Services and controllers
import { AuthService } from './services/auth.service';
import { MfaService } from './services/mfa.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core auth entities
      User,
      AuthCredential,
      RefreshToken,
      Membership,
      MFAConfig,
      AuthSession,
      LoginAttempt,
      // Auth-specific
      IdentityProvider,
      Invitation,
      // Org (for white-label)
      Organization,
      // RBAC (for permission resolution in JWT)
      Role,
      RolePermission,
      Permission,
      MembershipRole,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'supersecret',
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessTokenExpiry', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MfaService, JwtStrategy],
  exports: [AuthService, MfaService, JwtModule, PassportModule],
})
export class AuthModule {}
