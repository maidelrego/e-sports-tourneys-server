import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ConnectedClient {
  [id: string]: Socket;
}

@Injectable()
export class ServerWsService {
  private connectedClients: ConnectedClient = {};

  handleConnection(client: Socket) {
    console.log('Client connected', client.id);
    this.connectedClients[client.id] = client;
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);
    delete this.connectedClients[client.id];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }
}
