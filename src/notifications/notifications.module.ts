import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { AuthModule } from '@src/auth/auth.module';
import { ServerWsModule } from '@src/server-ws/server-ws.module';
import { FriendsModule } from '@src/friends/friends.module';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  imports: [
    TypeOrmModule.forFeature([Notification]),
    AuthModule,
    ServerWsModule,
    FriendsModule,
  ],
})
export class NotificationsModule {}
