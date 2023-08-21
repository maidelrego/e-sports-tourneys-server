import {
  OnGatewayConnection,
  WebSocketGateway,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ServerWsService } from './server-ws.service';

@WebSocketGateway({ cors: true, namespace: 'general' })
export class ServerWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly serverWsService: ServerWsService) {}

  handleConnection(client: Socket) {
    this.serverWsService.handleConnection(client);

    this.server.emit(
      'clients-list',
      this.serverWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    this.serverWsService.handleDisconnect(client);

    this.server.emit('disconnectedClient', client.id);
  }
}
