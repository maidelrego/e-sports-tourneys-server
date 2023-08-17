import { IsString, MinLength, IsNumber } from 'class-validator';
import { Tournament } from '../../tournaments/entities/tournament.entity';

export class CreateTeamDto {
  @IsString()
  @MinLength(1)
  userName: string;

  @IsString()
  teamName: string;

  @IsString()
  logoUrl: string;

  @IsNumber()
  tournamentId: Tournament;
}
