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
import { In, Repository } from 'typeorm';
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
  async findGamesByTournamentId(tournamentId: number) {
    try {
      const teams = await this.teamRepository
        .createQueryBuilder('team')
        .select('team.id')
        .where('team.tournamentId = :tournamentId', { tournamentId })
        .getRawMany();

      const teamsIds = teams.map((team) => team.team_id);

      const games = await this.gameRepository.find({
        where: [{ team1: In([...teamsIds]) }, { team2: In([...teamsIds]) }],
        relations: ['team1', 'team2'],
        order: {
          id: 'ASC',
        },
      });

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

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    const game = await this.gameRepository.preload({
      id: id,
      ...updateGameDto,
    });

    if (!game) {
      throw new BadRequestException('Game not found');
    }

    try {
      const updatedGame = this.gameRepository.save(game);
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
