import { User } from '@src/auth/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';

export enum Status {
  PENDING = 'pending',
  ACEPTED = 'acepted',
  REJECTED = 'rejected',
}

@Entity({ name: 'friends' })
export class Friend {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ManyToOne(() => User, (user) => user.creatorfriendRequests, { eager: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => User, (user) => user.receivefriendRequests, { eager: true })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: string;
}
