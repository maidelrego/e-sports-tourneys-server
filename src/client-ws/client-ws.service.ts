import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ConnectedClient {
  [id: string]: Socket;
}

@Injectable()
export class ClientWsService {
  connectedClients: ConnectedClient = {};

  async handleConnection(client: Socket) {
    console.log('Client connected', client.id);
    this.connectedClients[client.id] = client;
  }

  async handleDisconnect(client: Socket) {
    console.log('Client disconnected', client.id);
    delete this.connectedClients[client.id];
  }
}
