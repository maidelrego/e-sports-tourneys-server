import { IsString } from 'class-validator';

export class CreateFriendDto {
  @IsString()
  receiver: string;
}
