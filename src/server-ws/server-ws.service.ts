import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

interface ConnectedClient {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class ServerWsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  private connectedClients: ConnectedClient = {};

  async handleConnection(client: Socket) {
    const userId = client.handshake.headers.auth as string;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (!user) throw new Error('User not found');

    this.checkUserConnection(user);

    this.connectedClients[client.id] = { socket: client, user };
    return user;
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.headers.auth as string;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (!user) throw new Error('User not found');

    delete this.connectedClients[client.id];

    return user;
  }

  getConnectedClients(): ConnectedClient {
    return this.connectedClients;
  }

  sendFriendInvitation(senderName: string, reiciver: User, metaData: string) {
    const client: Socket = this.findUserConnection(reiciver);

    if (client) {
      client.emit('friend-request-notification', {
        meta: metaData,
        sender: senderName,
      });
    }
  }

  checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedUser = this.connectedClients[clientId];

      if (connectedUser.user.id === user.id) {
        connectedUser.socket.disconnect();
        break;
      }
    }
  }

  findUserConnection(user: User): Socket {
    let clientSocket: Socket = null;

    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedUser = this.connectedClients[clientId];

      if (connectedUser.user.id === user.id) {
        clientSocket = connectedUser.socket;
        break;
      }
    }
    return clientSocket;
  }
}
