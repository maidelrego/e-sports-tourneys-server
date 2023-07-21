import { User } from 'src/auth/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'tournaments' })
export class Tournament {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  type: number;

  @Column()
  sport: number;

  // @Column()
  // admin: number;

  @Column({ unique: true, nullable: true })
  uniqueId: string;

  @ManyToOne(() => User, (user) => user.tournaments, { eager: true })
  admin: User;

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
