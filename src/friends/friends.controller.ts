import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Auth, GetUser } from '@src/auth/decorators';
import { User } from '@src/auth/entities/user.entity';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('pendingFriendRequests')
  @Auth()
  pendingFriendRequests(@GetUser() user: User) {
    return this.friendsService.pendingFriendRequests(user);
  }

  @Post('approve/:request_id')
  @Auth()
  approveFriendRequest(@Param('request_id') request_id: string) {
    return this.friendsService.approveFriendRequest(request_id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendsService.remove(id);
  }
}
