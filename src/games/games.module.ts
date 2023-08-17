import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { AuthModule } from '../auth/auth.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  controllers: [GamesController],
  providers: [GamesService],
  imports: [TypeOrmModule.forFeature([Game]), AuthModule, TeamsModule],
  exports: [GamesService, TypeOrmModule],
})
export class GamesModule {}
