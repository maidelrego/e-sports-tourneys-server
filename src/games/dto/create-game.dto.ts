import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { Team } from 'src/teams/entities/team.entity';

export class CreateGameDto {
  @IsObject()
  team1: Team;

  @IsObject()
  team2: Team;

  @IsNumber()
  @IsOptional()
  score1?: number;

  @IsNumber()
  @IsOptional()
  score2?: number;
}
