import { User } from '../../auth/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'tournaments' })
export class Tournament {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  tournamentName: string;

  @Column()
  type: number;

  @Column()
  sport: number;

  @Column({ unique: true, nullable: true })
  uniqueId: string;

  @Column('text', {
    array: true,
    default: [],
  })
  sharedAdmins: string[];

  @Column('text', {
    array: true,
    default: [],
  })
  sharedGuests: string[];

  @ManyToOne(() => User, (user) => user.tournaments, { eager: true })
  admin: User;

  @OneToMany(() => Team, (t) => t.tournamentId, {
    eager: true,
    onDelete: 'CASCADE',
  })
  teams: Team[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @BeforeInsert()
  async generateUniqueId() {
    this.uniqueId = uuidv4();
  }

  // Associations
  // admin: User;
}
