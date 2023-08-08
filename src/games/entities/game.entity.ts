import { Team } from 'src/teams/entities/team.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Team, (team) => team.gamesAsTeam1, {
    onDelete: 'CASCADE',
    nullable: true,
    eager: true,
  })
  team1: Team | null;

  @ManyToOne(() => Team, (team) => team.gamesAsTeam2, {
    onDelete: 'CASCADE',
    nullable: true,
    eager: true,
  })
  team2: Team | null;

  @Column({ nullable: true })
  score1: number;

  @Column({ nullable: true })
  score2: number;

  @Column({ nullable: true })
  tournamentId: number;

  @Column({ nullable: true })
  nextMatchId: number;

  @Column({ nullable: true })
  tournamentRoundText: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date;
}
