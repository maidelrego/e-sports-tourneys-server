import {
  OnGatewayConnection,
  WebSocketGateway,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientWsService } from './client-ws.service';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: 'general' })
export class ClientWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly clientWsService: ClientWsService) {}

  async handleConnection(client: Socket) {
    await this.clientWsService.handleConnection(client);

    this.server.emit('newClient', client.id);
  }

  async handleDisconnect(client: Socket) {
    await this.clientWsService.handleDisconnect(client);

    this.server.emit('disconnectedClient', client.id);
  }
}
