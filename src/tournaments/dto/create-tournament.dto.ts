import { IsString, MinLength, IsNumber, IsArray } from 'class-validator';
import { IRequestTeam } from 'src/teams/interfaces/team.interface';

export class CreateTournamentDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  type: number;

  @IsNumber()
  sport: number;

  @IsNumber()
  games: number;

  @IsArray()
  teams: IRequestTeam[];
}
