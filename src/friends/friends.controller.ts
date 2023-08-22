import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Auth, GetUser } from '@src/auth/decorators';
import { User } from '@src/auth/entities/user.entity';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @Auth()
  create(@Body() createFriendDto: CreateFriendDto, @GetUser() creator: User) {
    return this.friendsService.create(createFriendDto, creator);
  }

  @Get('approve/:request_id')
  @Auth()
  approveFriendRequest(@Param('request_id') request_id: string) {
    return this.friendsService.approveFriendRequest(request_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendsService.update(+id, updateFriendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendsService.remove(+id);
  }
}
