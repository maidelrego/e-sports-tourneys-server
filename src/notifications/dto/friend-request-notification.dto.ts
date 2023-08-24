import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationTypes } from '../entities/notification.entity';

export class FriendRequestNotificationDto {
  @IsString()
  receiver: string;

  @IsBoolean()
  @IsOptional()
  read: boolean;

  @IsEnum(NotificationTypes)
  type: string;
}
