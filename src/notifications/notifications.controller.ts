import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Auth, GetUser } from '@src/auth/decorators';
import { User } from '@src/auth/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Auth()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @GetUser() user: User,
  ) {
    return this.notificationsService.create(createNotificationDto, user);
  }

  @Get('find-notifications')
  @Auth()
  findAll(@GetUser() user: User) {
    return this.notificationsService.findNotificationByUser(user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
