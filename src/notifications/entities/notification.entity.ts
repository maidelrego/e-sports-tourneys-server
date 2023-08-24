import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum NotificationTypes {
  FRIEND_REQUEST = 'friend_request',
  TOURNAMENT_REQUEST = 'tournament_request',
  INVITATION_TOURNAMENT = 'invitation_tournament',
}
@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ManyToOne(() => User, (user) => user.receivedNotifications, { eager: false })
  receiver: User;

  @ManyToOne(() => User, (user) => user.sentNotifications, { eager: true })
  sender: User;

  @Column('bool', { default: false })
  read: boolean;

  @Column({
    type: 'enum',
    enum: NotificationTypes,
  })
  type: string;

  @Column({ nullable: true })
  meta: string;

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
