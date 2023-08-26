import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { NotificationTypes } from '../entities/notification.entity';

export class FriendRequestNotificationDto {
  @IsString()
  @MaxLength(10)
  receiver: string;

  @IsBoolean()
  @IsOptional()
  read: boolean;

  @IsEnum(NotificationTypes)
  type: string;
}
