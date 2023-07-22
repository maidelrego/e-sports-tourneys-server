import { IsString, MinLength, IsNumber } from 'class-validator';
import { Tournament } from 'src/tournaments/entities/tournament.entity';

export class CreateTeamDto {
  @IsString()
  @MinLength(1)
  userName: string;

  @IsString()
  teamName: string;

  @IsNumber()
  tournamentId: Tournament;
}
