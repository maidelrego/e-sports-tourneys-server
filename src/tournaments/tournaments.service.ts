import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Team } from 'src/teams/entities/team.entity';
import {
  TeamStats,
  getTournamentStandings,
} from 'src/helpers/getTournamentStandings';
import { generateGroupPhaseGames } from 'src/helpers/generateLeague';
import { generateKnockoutGames } from 'src/helpers/generateCup';
import { Game } from 'src/games/entities/game.entity';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger('TournamentsService');
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTournamentDto: CreateTournamentDto, user: User) {
    const { teams, ...rest } = createTournamentDto;

    let queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let teamsEntities: Team[] = [];
    let tournamentEntity: Tournament = null;

    try {
      // Create a tournament
      const tournament = new Tournament();
      tournament.tournamentName = rest.tournamentName;
      tournament.type = rest.type;
      tournament.sport = rest.sport;
      tournament.admin = user;
      tournamentEntity = await queryRunner.manager.save(tournament);

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

      switch (tournament.type) {
        case 1:
          queryRunner = await generateGroupPhaseGames(
            queryRunner,
            teamsEntities,
            tournamentEntity.id,
          );
          break;
        case 2:
          queryRunner = await generateKnockoutGames(
            queryRunner,
            teamsEntities,
            tournamentEntity.id,
          );
          break;

        default:
          throw new Error('Invalid tournament type');
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

  async findAllWithAdmin(user: User) {
    const structuredTournaments = [];

    const tournaments = await this.tournamentRepository.find({
      where: { admin: { id: user.id } },
    });

    for (const tournament of tournaments) {
      const gamesPlayed = await this.gameRepository.count({
        where: {
          tournamentId: tournament.id,
          score1: Not(IsNull()),
          score2: Not(IsNull()),
        },
      });

      structuredTournaments.push({
        ...tournament,
        gamesPlayed: gamesPlayed,
      });
    }

    return structuredTournaments;
  }

  async tournamentStandings(tournamentId: number) {
    const tournament = await this.tournamentRepository
      .createQueryBuilder('tournament')
      .leftJoinAndSelect('tournament.teams', 'teams')
      .leftJoinAndSelect('teams.gamesAsTeam1', 'gamesAsTeam1')
      .leftJoinAndSelect('teams.gamesAsTeam2', 'gamesAsTeam2')
      .where('tournament.id = :id', { id: tournamentId })
      .getOne();

    const standings: TeamStats[] = getTournamentStandings(tournament.teams);
    return standings;
  }

  findOne(id: number) {
    return this.tournamentRepository.findOne({
      where: { id },
      relations: ['teams'],
    });
  }

  async remove(id: number) {
    return this.tournamentRepository.delete(id);
  }

  private handleDatabaseExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server');
  }
}
