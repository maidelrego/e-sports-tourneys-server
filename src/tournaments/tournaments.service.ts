import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger('TournamentsService');
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
  ) {}

  async create(createTournamentDto: CreateTournamentDto) {
    try {
      const tournament = this.tournamentRepository.create(createTournamentDto);
      // console.log(tournament);
      return await this.tournamentRepository.save(tournament);
    } catch (error) {
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
    return `This action returns a #${id} tournament`;
  }

  update(id: number, updateTournamentDto: UpdateTournamentDto) {
    return `This action updates a #${id} tournament`;
  }

  remove(id: number) {
    return `This action removes a #${id} tournament`;
  }

  private handleDatabaseExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server');
  }
}
