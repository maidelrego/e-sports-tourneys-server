import { IsString, MinLength, IsNumber } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';

export class CreateTournamentDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  type: number;

  @IsNumber()
  sport: number;

  @IsNumber()
  admin: User;
}
