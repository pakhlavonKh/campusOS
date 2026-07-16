import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, AuthCredential, RefreshToken, Membership, ParentLink } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuthCredential, RefreshToken, Membership, ParentLink])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class UsersModule {}
