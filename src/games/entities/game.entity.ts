import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  team1: number;

  @Column()
  team2: number;

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
