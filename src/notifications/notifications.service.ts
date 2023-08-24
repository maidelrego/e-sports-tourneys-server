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
    try {
      const receiverUser: User = await this.authService.findUserById(receiver);

      const notification = this.notificationRepository.create({
        type: type,
        receiver: receiverUser,
        sender: sender,
      });

      //TODO: We have to create a switch for type of notification
      if (type === NotificationTypes.FRIEND_REQUEST) {
        const savedFriendRequest = await this.friendService.create(
          sender,
          receiverUser,
        );

        metaData = savedFriendRequest.id;

        this.serverWService.sendFriendInvitation(
          sender.fullName,
          receiverUser,
          metaData,
        );
      }

      await this.notificationRepository.save({
        ...notification,
        meta: metaData,
      });
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

  remove(id: number) {
    return this.notificationRepository.delete(id);
  }

  private handleDatabaseExceptions(error: any) {
    console.log(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server',
      error,
    );
  }
}
