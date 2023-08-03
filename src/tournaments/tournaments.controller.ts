import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @Auth()
  create(
    @Body() createTournamentDto: CreateTournamentDto,
    @GetUser() user: User,
  ) {
    return this.tournamentsService.create(createTournamentDto, user);
  }

  @Post('generateJWT')
  @Auth()
  generateJWT(
    @Body() data: { uniqueId: string; accessType: 'sharedAdmins' | 'guest' },
  ) {
    const { uniqueId, accessType } = data;
    return this.tournamentsService.generateTournamentToken(
      uniqueId,
      accessType,
    );
  }

  @Post('join')
  @Auth()
  async joinTournament(@Body() data: { token: string }, @GetUser() user: User) {
    const { token } = data;
    console.log('token', token);

    // Decode the JWT to extract uniqueId and accessType
    const decoded = this.tournamentsService.decodeTournamentToken(token);

    console.log('decoded', decoded);

    if (!decoded) {
      throw new UnauthorizedException('Invalid JWT token.');
    }

    // Proceed with joining the tournament based on the decoded data
    await this.tournamentsService.joinTournament(
      decoded.uniqueId,
      decoded.accessType,
      user,
    );

    return { message: 'Successfully joined tournament.' };
  }

  @Get()
  @Auth()
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get('byAdminId')
  @Auth()
  getTournamentsByAdminId(@GetUser() user: User) {
    return this.tournamentsService.findAllWithAdmin(user);
  }

  @Get('standings/:id')
  @Auth()
  tournamentStandings(@Param('id') id: number) {
    return this.tournamentsService.tournamentStandings(id);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: number) {
    return this.tournamentsService.findOne(id);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(+id);
  }
}
