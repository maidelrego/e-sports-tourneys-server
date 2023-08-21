import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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

  @Column({ nullable: true })
  receiver: string;

  @ManyToOne(() => User, (user) => user.notifications, { eager: true })
  sender: User;

  @Column('bool', { default: false })
  read: boolean;

  @Column({
    type: 'enum',
    enum: NotificationTypes,
  })
  type: string;
}
