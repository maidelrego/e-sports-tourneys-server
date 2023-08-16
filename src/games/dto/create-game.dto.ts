import { IsNumber, IsObject, IsOptional, Min } from 'class-validator';
import { Team } from 'src/teams/entities/team.entity';

export class CreateGameDto {
  @IsObject()
  team1: Team;

  @IsObject()
  team2: Team;

  @IsNumber()
  @Min(0)
  @IsOptional()
  score1?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  score2?: number;

  @IsNumber()
  @IsOptional()
  tournamentId?: number;

  @IsNumber()
  @IsOptional()
  nextMatchId?: number;

  @IsOptional()
  tournamentRoundText?: string;

  @IsOptional()
  nextMatchPlace?: string;
}
