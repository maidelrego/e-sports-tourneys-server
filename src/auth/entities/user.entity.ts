import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Notification } from '../../notifications/entities/notification.entity';
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

  @Column('text', { unique: true, nullable: true })
  nickname: string;

  static usedNumbers: Set<number> = new Set();

  @Column('text', { nullable: true })
  googleId: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @OneToMany(() => Tournament, (t) => t.admin)
  tournaments: Tournament;

  @OneToMany(() => Notification, (n) => n.sender, { onDelete: 'CASCADE' })
  notifications: Notification;

  @BeforeInsert()
  emailToLowerCaseInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeInsert()
  generateUniqueNickname() {
    const baseNickname = this.fullName.replace(/\s+/g, '').toLowerCase();

    let randomSuffix: number;
    do {
      randomSuffix = Math.floor(Math.random() * 9000) + 1000; // Generate a random 4-digit number
    } while (User.usedNumbers.has(randomSuffix));

    User.usedNumbers.add(randomSuffix);

    this.nickname = `${baseNickname}${randomSuffix}`;
  }

  @BeforeUpdate()
  emailToLowerCaseUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
