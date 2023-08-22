import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { Friend } from './entities/friend.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService],
  imports: [TypeOrmModule.forFeature([Friend]), AuthModule],
})
export class FriendsModule {}
