import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, AuthCredential, RefreshToken, Membership, ParentLink, MFAConfig, AuthSession, LoginAttempt } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AuthCredential,
      RefreshToken,
      Membership,
      ParentLink,
      MFAConfig,
      AuthSession,
      LoginAttempt,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
