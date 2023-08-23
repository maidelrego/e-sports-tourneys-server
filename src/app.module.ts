import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { TeamsModule } from './teams/teams.module';
import { GamesModule } from './games/games.module';
import { EmailService } from './email/email.service';
import { NotificationsModule } from './notifications/notifications.module';
import { ServerWsModule } from './server-ws/server-ws.module';
import { FriendsModule } from './friends/friends.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl:
          process.env.STAGE === 'prod' ? { rejectUnauthorized: false } : null,
      },
      type: 'postgres',
      url: process.env.DB_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    TournamentsModule,
    TeamsModule,
    GamesModule,
    NotificationsModule,
    ServerWsModule,
    FriendsModule,
    CloudinaryModule,
  ],
  controllers: [],
  providers: [EmailService],
})
export class AppModule {}
