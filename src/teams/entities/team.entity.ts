import { Game } from 'src/games/entities/game.entity';
import { Tournament } from 'src/tournaments/entities/tournament.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @ManyToOne(() => Tournament, (t) => t.id)
  tournamentId: Tournament;

  @OneToMany(() => Game, (g) => g.team1, { eager: true })
  game1: Game;

  @OneToMany(() => Game, (g) => g.team2, { eager: true })
  game2: Game;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
