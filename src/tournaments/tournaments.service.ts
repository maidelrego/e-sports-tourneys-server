import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Game } from 'src/games/entities/game.entity';
import {
  TeamStats,
  getTournamentStandings,
} from 'src/helpers/getTournamentStandings';

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
          queryRunner = await this.generateGroupPhaseGames(
            queryRunner,
            teamsEntities,
            tournamentEntity.id,
          );
          break;
        case 2:
          queryRunner = await this.generateKnockoutGames(
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

  findAllWithAdmin(user: User) {
    return this.tournamentRepository.find({
      where: { admin: { id: user.id } },
    });
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

  update(id: number, updateTournamentDto: UpdateTournamentDto) {
    return `This action updates a #${id} tournament`;
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

  private async generateGroupPhaseGames(
    queryRunner: QueryRunner,
    teams: Team[],
    tournamentid: number,
  ) {
    const games: Game[] = [];

    // Loop through each team and create matches against other teams
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const homeGame = new Game();
        homeGame.team1 = teams[i];
        homeGame.team2 = teams[j];
        homeGame.tournametId = tournamentid;

        const awayGame = new Game();
        awayGame.team1 = teams[j];
        awayGame.team2 = teams[i];
        awayGame.tournametId = tournamentid;

        games.push(homeGame);
        games.push(awayGame);
      }
    }

    for (const item of games) {
      await queryRunner.manager.save(item);
    }

    return queryRunner;
  }

  private async generateKnockoutGames(
    queryRunner: QueryRunner,
    teams: Team[],
    tournamentid: number,
  ) {
    if (teams.length < 16) {
      throw new Error('Not enough teams to create a cup with 16 teams.');
    }

    // Step 2: Shuffle the teams array randomly
    const shuffledTeams = this.shuffleArray(teams);

    // Step 3: Split the array into two halves
    const firstHalf = shuffledTeams.slice(0, 8);
    const secondHalf = shuffledTeams.slice(8, 16);

    // Step 7: Create the Final game, linking it to the Semi-finals games
    const final: Game = new Game();
    final.nextMatchId = null; // Link to the first Semi-finals game
    final.tournamentRoundText = '4';
    final.tournametId = tournamentid;
    const finalSaved = await queryRunner.manager.save(final);

    // Step 6: Create Game entities for Semi-finals, linking them to Round of 8 games
    const semiFinals: Game[] = [];
    for (let i = 0; i < 2; i++) {
      const game: Game = new Game();
      game.nextMatchId = finalSaved.id; // Link to the corresponding Round of 8 game
      game.tournamentRoundText = '3';
      game.tournametId = tournamentid;
      const savedGame = await queryRunner.manager.save(game);
      semiFinals.push(savedGame);
    }

    // Step 5: Create Game entities for Round of 8, linking them to Round of 16 games
    const roundOf8: Game[] = [];
    let roundOf8Ref = 0;
    for (let i = 0; i < 4; i++) {
      const game: Game = new Game();
      roundOf8Ref = this.calculateRef(i, roundOf8Ref);
      game.nextMatchId = semiFinals[roundOf8Ref].id; // Link to the corresponding Round of 16 game
      game.tournamentRoundText = '2';
      game.tournametId = tournamentid;
      const savedGame = await queryRunner.manager.save(game);
      roundOf8.push(savedGame);
    }

    // Step 4: Create Game entities for each pair of teams in Round of 16
    const roundOf16: Game[] = [];
    let roundOf16Ref = 0;
    for (let i = 0; i < 8; i++) {
      const game: Game = new Game();
      game.team1 = firstHalf[i];
      game.team2 = secondHalf[i];
      game.tournamentRoundText = '1'; // Set the initial round
      game.tournametId = tournamentid;
      roundOf16Ref = this.calculateRef(i, roundOf16Ref);
      game.nextMatchId = roundOf8[roundOf16Ref].id;
      const savedGame = await queryRunner.manager.save(game);
      roundOf16.push(savedGame);
    }

    return queryRunner;
  }

  // Helper function to shuffle the array
  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private calculateRef(iteration: number, ref: number) {
    if (iteration != 0 && iteration % 2 === 0) {
      ref++;
    }
    return ref;
  }
}
