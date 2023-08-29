import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Auth, GetUser } from '@src/auth/decorators';
import { User } from '@src/auth/entities/user.entity';
import { FriendRequestNotificationDto } from './dto/friend-request-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Auth()
  create(
    @Body()
    genaricNotificationDto:
      | CreateNotificationDto
      | FriendRequestNotificationDto,
    @GetUser() user: User,
  ) {
    return this.notificationsService.create(genaricNotificationDto, user);
  }

  @Put(':id')
  @Auth()
  update(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Get('find-notifications')
  @Auth()
  findAll(@GetUser() user: User) {
    return this.notificationsService.findNotificationByUser(user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
