import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@src/auth/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto, sender: User) {
    try {
      const notification = this.notificationRepository.create({
        ...createNotificationDto,
        sender: sender,
      });

      return this.notificationRepository.save(notification);
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  async findNotificationByUser(user: User) {
    try {
      const notifications = await this.notificationRepository.find({
        where: { receiver: user.id, read: false },
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
    throw new InternalServerErrorException('Unexpected error, check server');
  }
}
