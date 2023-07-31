import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
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
  tournamentStandings(@Param('id') id: number) {
    return this.tournamentsService.tournamentStandings(id);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: number) {
    return this.tournamentsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(+id);
  }
}
