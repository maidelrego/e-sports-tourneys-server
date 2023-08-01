import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { Team } from 'src/teams/entities/team.entity';

@Injectable()
export class GamesService {
  private readonly logger = new Logger('TeamsService');
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  create(createGameDto: CreateGameDto) {
    try {
      const game = this.gameRepository.create(createGameDto);
      return this.gameRepository.save(game);
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  findAll() {
    try {
      return this.gameRepository.find();
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  findGamesByTournamentId(tournamentId: number) {
    try {
      //TODO: Old query
      // const teams = await this.teamRepository
      //   .createQueryBuilder('team')
      //   .select('team.id')
      //   .where('team.tournamentId = :tournamentId', { tournamentId })
      //   .getRawMany();

      // const teamsIds = teams.map((team) => team.team_id);

      // const games = await this.gameRepository.find({
      //   where: [{ team1: In([...teamsIds]) }, { team2: In([...teamsIds]) }],
      //   relations: ['team1', 'team2'],
      //   order: {
      //     id: 'ASC',
      //   },
      // });

      const games = this.gameRepository
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.team1', 'team1')
        .leftJoinAndSelect('game.team2', 'team2')
        .where('game.tournamentId = :tournamentId', { tournamentId })
        .orderBy('game.id', 'DESC')
        .getMany();

      return games;
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  findByTeam(teamId: number) {
    try {
      return this.gameRepository.find({
        where: [{ team1: { id: teamId } }, { team2: { id: teamId } }],
      });
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.gameRepository.preload({
      id: id,
      ...updateGameDto,
    });

    if (!game) {
      throw new BadRequestException('Game not found');
    }

    if (game.nextMatchId) {
      const nextMatch = await this.gameRepository.findOne({
        where: { id: game.nextMatchId },
      });

      if (!nextMatch) {
        throw new BadRequestException('Next Match not found');
      }

      const winningTeam = game.score1 > game.score2 ? game.team1 : game.team2;

      if (nextMatch.team1 === null) {
        nextMatch.team1 = winningTeam;
      } else {
        nextMatch.team2 = winningTeam;
      }
      await this.gameRepository.save(nextMatch);
    }

    try {
      const updatedGame = await this.gameRepository.save(game);
      return updatedGame;
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }

  private handleDatabaseExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server');
  }
}
