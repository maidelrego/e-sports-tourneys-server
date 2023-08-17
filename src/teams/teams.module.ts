import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './entities/team.entity';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [TeamsController],
  providers: [TeamsService],
  imports: [TypeOrmModule.forFeature([Team]), AuthModule],
  exports: [TeamsService, TypeOrmModule],
})
export class TeamsModule {}
