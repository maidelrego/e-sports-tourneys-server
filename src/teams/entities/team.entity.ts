import { Game } from 'src/games/entities/game.entity';
import { Tournament } from 'src/tournaments/entities/tournament.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'teams' })
export class Team {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  userName: string;

  @Column()
  teamName: string;

  @Column({ nullable: true })
  logoUrl: string;

  @ManyToOne(() => Tournament, (t) => t.id, { onDelete: 'CASCADE' })
  tournamentId: Tournament;

  // One team can have multiple games, so it's a one-to-many relationship
  @OneToMany(() => Game, (game) => game.team1)
  gamesAsTeam1: Game[];

  // One team can be in multiple games as the second team, so it's another one-to-many relationship
  @OneToMany(() => Game, (game) => game.team2)
  gamesAsTeam2: Game[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
