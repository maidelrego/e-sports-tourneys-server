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
import { Team } from '../teams/entities/team.entity';

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

      if (nextMatch.score1 !== null || nextMatch.score2 !== null) {
        throw new BadRequestException('Next Match has already been played');
      }

      const winningTeam = game.score1 > game.score2 ? game.team1 : game.team2;

      if (game.nextMatchPlace === 'home') {
        nextMatch.team1 = winningTeam;
      } else if (game.nextMatchPlace === 'away') {
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
