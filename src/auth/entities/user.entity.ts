import { Tournament } from 'src/tournaments/entities/tournament.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false, nullable: true })
  password: string;

  @Column('text')
  fullName: string;

  @Column('text', { nullable: true })
  googleId: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @OneToMany(() => Tournament, (t) => t.admin)
  tournaments: Tournament;

  @BeforeInsert()
  emailToLowerCaseInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  emailToLowerCaseUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
