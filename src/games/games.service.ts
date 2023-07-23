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

@Injectable()
export class GamesService {
  private readonly logger = new Logger('TeamsService');
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
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

  findByTeam(teamId: number) {
    try {
      return this.gameRepository.find({
        where: [{ team1: teamId }, { team2: teamId }],
      });
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game`;
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
