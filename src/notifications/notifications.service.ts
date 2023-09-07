import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  Notification,
  NotificationTypes,
} from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@src/auth/entities/user.entity';
import { FriendRequestNotificationDto } from './dto/friend-request-notification.dto';
import { ServerWsService } from '@src/server-ws/server-ws.service';
import { AuthService } from '@src/auth/auth.service';
import { FriendsService } from '@src/friends/friends.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly serverWService: ServerWsService,
    private readonly friendService: FriendsService,
    private readonly authService: AuthService,
  ) {}

  async create(
    genericNotificationDto:
      | CreateNotificationDto
      | FriendRequestNotificationDto,
    sender: User,
  ) {
    const { receiver, type } = genericNotificationDto;

    let metaData = null;
    let notification = null;

    try {
      const receiverUser: User = await this.authService.findUser(
        'nickname',
        receiver,
      );

      if (!receiverUser) {
        return {
          ok: false,
          msg: 'Nickname not found',
        };
      }

      if (receiverUser.friends.find((u) => u.id === sender.id)) {
        return {
          ok: false,
          msg: 'You are already friends',
        };
      }

      if (
        await this.friendService.existPendingRequest(sender.id, receiverUser.id)
      ) {
        return {
          ok: false,
          msg: 'You are already have a pending friend request',
        };
      }

      const notificationData = this.notificationRepository.create({
        type: type,
        receiver: receiverUser,
        sender: sender,
        createdAt: new Date(),
      });

      metaData = await this.friendService.create(sender, receiverUser);

      notification = await this.notificationRepository.save({
        ...notificationData,
        meta: metaData.id,
      });

      switch (type) {
        case NotificationTypes.FRIEND_REQUEST:
          this.serverWService.sendFriendInvitation(receiverUser, notification);
          break;
        case NotificationTypes.TOURNAMENT_REQUEST:
          this.serverWService.sendFriendInvitation(receiverUser, notification);
          break;
        default:
          break;
      }

      return {
        ok: true,
        msg: 'Request sent successfully',
      };
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  async markAsRead(id: string) {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: id },
      });

      if (!notification)
        throw new InternalServerErrorException('Notification not found');

      notification.read = true;
      await this.notificationRepository.save(notification);
      return notification;
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  async findNotificationByUser(user: User) {
    try {
      const notifications = await this.notificationRepository.find({
        where: { receiver: { id: user.id }, read: false },
      });
      return notifications;
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  async remove(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: id },
    });

    if (!notification)
      throw new InternalServerErrorException('Notification not found');

    const { meta, type } = notification;

    if (type === NotificationTypes.FRIEND_REQUEST) {
      await this.friendService.remove(meta);
    }

    await this.notificationRepository.delete(id);
  }

  private handleDatabaseExceptions(error: any) {
    throw new InternalServerErrorException(
      'Unexpected error, check server',
      error,
    );
  }
}
