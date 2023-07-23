import { IsNumber, IsOptional } from 'class-validator';

export class CreateGameDto {
  @IsNumber()
  team1: number;

  @IsNumber()
  team2: number;

  @IsNumber()
  @IsOptional()
  score1?: number;

  @IsNumber()
  @IsOptional()
  score2?: number;
}
