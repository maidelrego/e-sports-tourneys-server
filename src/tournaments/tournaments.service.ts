import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { DataSource, Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Team } from 'src/teams/entities/team.entity';
import { JwtService } from '@nestjs/jwt';
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
    private readonly jwtService: JwtService,
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

  async generateTournamentToken(uniqueId, accessType) {
    const payload = { uniqueId, accessType };
    const token = this.jwtService.sign(payload);

    return token;
  }

  async joinTournament(
    uniqueId: string,
    accessType: 'sharedAdmins' | 'guest',
    user: User,
  ): Promise<void> {
    if (accessType !== 'sharedAdmins' && accessType !== 'guest')
      throw new BadRequestException('Invalid access type.');

    const { id: userId } = user;

    const tournament = await this.tournamentRepository.findOne({
      where: { uniqueId: uniqueId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found.');
    }

    if (tournament.admin.id === user.id)
      throw new UnauthorizedException('You cannot join your own tournament.');

    if (
      tournament.sharedAdmins.includes(userId.toString()) ||
      tournament.sharedGuests.includes(userId.toString())
    ) {
      throw new UnauthorizedException(
        'You are already part of this tournament.',
      );
    }

    if (accessType === 'sharedAdmins') {
      tournament.sharedAdmins.push(userId);
    } else if (accessType === 'guest') {
      tournament.sharedGuests.push(userId);
    }

    await this.tournamentRepository.save(tournament);
  }

  findAll() {
    return `This action returns all tournaments`;
  }

  async findAllWithAdmin(user: User) {
    const structuredTournaments = [];

    const tournaments = await this.tournamentRepository
      .createQueryBuilder('tournament')
      .leftJoinAndSelect('tournament.teams', 'teams')
      .leftJoinAndSelect('teams.gamesAsTeam1', 'gamesAsTeam1')
      .leftJoinAndSelect('teams.gamesAsTeam2', 'gamesAsTeam2')
      .where('tournament.admin = :userId', { userId: user.id }) // User is an admin
      .orWhere('tournament.sharedAdmins @> ARRAY[:userId]', { userId: user.id }) // User is in sharedAdmins array
      .orWhere('tournament.sharedGuests @> ARRAY[:userId]', { userId: user.id }) // User is in sharedGuests array
      .orderBy('tournament.createdAt', 'DESC')
      .getMany();

    for (const tournament of tournaments) {
      const standings: TeamStats[] = getTournamentStandings(tournament.teams);

      const games = await this.gameRepository.find({
        where: {
          tournamentId: tournament.id,
        },
      });

      const gamesTotal = games.length;
      const gamesPlayed = games.filter(
        (game) => game.score1 !== null && game.score2 !== null,
      ).length;

      structuredTournaments.push({
        ...tournament,
        gamesPlayed,
        gamesTotal,
        status:
          gamesPlayed !== gamesTotal
            ? 'In progress.......'
            : standings[0].team.userName,
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

  decodeTournamentToken(
    token: string,
  ): { uniqueId: string; accessType: 'sharedAdmins' | 'guest' } | null {
    try {
      const decodedToken = this.jwtService.verify(token);
      return decodedToken;
    } catch (error) {
      return null;
    }
  }
}
