import { IsNumber } from 'class-validator';
import { Team } from 'src/teams/entities/team.entity';

export class CreateGameDto {
  @IsNumber()
  team1: Team;

  @IsNumber()
  team2: Team;

  @IsNumber()
  score1?: number;

  @IsNumber()
  score2?: number;
}
