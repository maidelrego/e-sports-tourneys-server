import { Team } from 'src/teams/entities/team.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Team, (team) => team.gamesAsTeam1, {
    onDelete: 'CASCADE',
  })
  team1: Team;

  @ManyToOne(() => Team, (team) => team.gamesAsTeam2, {
    onDelete: 'CASCADE',
  })
  team2: Team;

  @Column({ nullable: true })
  score1: number;

  @Column({ nullable: true })
  score2: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
