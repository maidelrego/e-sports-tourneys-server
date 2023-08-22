import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { User } from '@src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend, Status } from './entities/friend.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createFriendDto: CreateFriendDto, creator: User) {
    try {
      const receiver = await this.userRepository.findOne({
        where: { id: createFriendDto.receiver },
      });

      if (!creator || !receiver) {
        throw new NotFoundException('Users not found');
      }

      const friendRequest = new Friend();
      friendRequest.creator = creator;
      friendRequest.receiver = receiver;

      return this.friendRepository.save(friendRequest);
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  async approveFriendRequest(requestId: string) {
    const request = await this.friendRepository.findOne({
      where: { id: requestId },
      relations: ['creator', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    request.status = Status.ACEPTED;
    await this.friendRepository.save(request);

    const creator = await this.userRepository.findOne({
      where: { id: request.creator.id },
      relations: ['friends'],
    });

    const receiver = await this.userRepository.findOne({
      where: { id: request.receiver.id },
      relations: ['friends'],
    });

    // Create the friendship
    creator.friends.push(request.receiver);
    receiver.friends.push(request.creator);

    await this.userRepository.save([creator, receiver]);
  }

  update(id: number, updateFriendDto: UpdateFriendDto) {
    return `This action updates a #${id} friend`;
  }

  remove(id: number) {
    return `This action removes a #${id} friend`;
  }

  private handleDatabaseExceptions(error: any) {
    throw new InternalServerErrorException('Unexpected error, check server');
  }
}