import { Team } from 'src/teams/entities/team.entity';
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

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Team, (t) => t.id)
  team1: Team;

  @ManyToOne(() => Team, (t) => t.id)
  team2: Team;

  @Column({ default: 0 })
  score1: number;

  @Column({ default: 0 })
  score2: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
