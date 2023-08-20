import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ManyToOne(() => User, (user) => user.notifications, { eager: true })
  User: User;

  @Column('bool', { default: false })
  read: boolean;
}
