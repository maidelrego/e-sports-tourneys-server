import {
  IsString,
  MinLength,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';
import { IRequestTeam } from 'src/teams/interfaces/team.interface';

export class CreateTournamentDto {
  @IsString()
  @MinLength(1)
  tournamentName: string;

  @IsNumber()
  type: number;

  @IsNumber()
  sport: number;

  @IsNumber()
  @IsOptional()
  games?: number;

  @IsArray()
  teams: IRequestTeam[];
}
