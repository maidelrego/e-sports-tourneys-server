import { Module } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from './entities/tournament.entity';
import { AuthModule } from '../auth/auth.module';
import { GamesModule } from '../games/games.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  controllers: [TournamentsController],
  providers: [TournamentsService],
  imports: [
    TypeOrmModule.forFeature([Tournament]),
    AuthModule,
    GamesModule,
    TeamsModule,
  ],
  exports: [TournamentsService, TypeOrmModule],
})
export class TournamentsModule {}
