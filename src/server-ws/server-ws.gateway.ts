import {
  OnGatewayConnection,
  WebSocketGateway,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ServerWsService } from './server-ws.service';

@WebSocketGateway({ cors: true, namespace: 'general' })
export class ServerWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly serverWsService: ServerWsService) {}

  @SubscribeMessage('get-connected-clients')
  async getConnectedClients(client: Socket) {
    const allClients = await this.serverWsService.getConnectedClients();
    const users = Object.values(allClients).map(({ user }) => user);
    client.emit('connected-clients', users);
  }

  async handleConnection(client: Socket) {
    const connectedUser = await this.serverWsService.handleConnection(client);
    const allClients = await this.serverWsService.getConnectedClients();

    for (const [id, { user }] of Object.entries(allClients)) {
      for (const friend of user.friends) {
        if (friend.id === connectedUser.id) {
          this.server.to(id).emit('connectedClient', connectedUser);
        }
      }
    }
  }

  async handleDisconnect(client: Socket) {
    const disconectedUser = await this.serverWsService.handleDisconnect(client);
    const allClients = await this.serverWsService.getConnectedClients();

    for (const [id, { user }] of Object.entries(allClients)) {
      for (const friend of user.friends) {
        if (friend.id === disconectedUser.id) {
          this.server.to(id).emit('disconnectedClient', disconectedUser);
        }
      }
    }
  }
}
