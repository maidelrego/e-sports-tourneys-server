import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { DataSource, Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Game } from 'src/games/entities/game.entity';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger('TournamentsService');
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTournamentDto: CreateTournamentDto, user: User) {
    const { teams, ...rest } = createTournamentDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let teamsEntities: Team[] = [];

    try {
      // Create a tournament
      const tournament = new Tournament();
      tournament.tournamentName = rest.tournamentName;
      tournament.type = rest.type;
      tournament.sport = rest.sport;
      tournament.admin = user;
      await queryRunner.manager.save(tournament);

      // Create teams
      for (const item of teams) {
        const team = new Team();
        team.teamName = item.teamName;
        team.userName = item.playerName;
        team.logoUrl = item.logoUrl;
        team.tournamentId = tournament;
        teamsEntities.push(team);
      }

      teamsEntities = await queryRunner.manager.save(teamsEntities);

      const games = this.generateGroupPhaseGames(teamsEntities);
      // Create Games
      for (const item of games) {
        await queryRunner.manager.save(item);
      }

      await queryRunner.commitTransaction(); // commit saves
      await queryRunner.release(); // exit query runner
      return tournament;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDatabaseExceptions(error);
    }
  }

  findAll() {
    return `This action returns all tournaments`;
  }

  findAllWithAdmin(user: User) {
    return this.tournamentRepository.find({
      where: { admin: { id: user.id } },
    });
  }

  findOne(id: number) {
    return this.tournamentRepository.findOne({
      where: { id },
      relations: ['teams'],
    });
  }

  update(id: number, updateTournamentDto: UpdateTournamentDto) {
    return `This action updates a #${id} tournament`;
  }

  async remove(id: number) {
    const tournamentToDelete = await this.findOne(id);
    const tournamentTeams = tournamentToDelete.teams.map((team) => team.id);

    const gamesToDelete = await this.dataSource
      .getRepository(Game)
      .createQueryBuilder('game')
      .where('game.team1 IN (:...teams)', { teams: tournamentTeams })
      .orWhere('game.team2 IN (:...teams)', { teams: tournamentTeams })
      .getMany();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(gamesToDelete);
      await queryRunner.manager.remove(tournamentToDelete);

      await queryRunner.commitTransaction(); // commit saves

      await queryRunner.release(); // exit query runner

      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDatabaseExceptions(error);
    }

    return 'Tournament deleted';
  }

  private handleDatabaseExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server');
  }

  private generateGroupPhaseGames(teams: Team[]) {
    const games: Game[] = [];

    // Loop through each team and create matches against other teams
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const homeGame = new Game();
        homeGame.team1 = teams[i].id;
        homeGame.team2 = teams[j].id;

        const awayGame = new Game();
        awayGame.team1 = teams[j].id;
        awayGame.team2 = teams[i].id;

        games.push(homeGame);
        games.push(awayGame);
      }
    }

    return games;
  }
}
