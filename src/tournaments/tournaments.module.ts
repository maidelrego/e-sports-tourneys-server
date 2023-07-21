import { Module } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from './entities/tournament.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [TournamentsController],
  providers: [TournamentsService],
  imports: [TypeOrmModule.forFeature([Tournament]), AuthModule],
  exports: [TournamentsService, TypeOrmModule],
})
export class TournamentsModule {}
