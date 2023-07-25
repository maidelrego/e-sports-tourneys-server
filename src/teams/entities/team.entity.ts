import { Tournament } from 'src/tournaments/entities/tournament.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
