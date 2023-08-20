import { Module } from '@nestjs/common';
import { ClientWsService } from './client-ws.service';
import { ClientWsGateway } from './client-ws.gateway';

@Module({
  providers: [ClientWsGateway, ClientWsService],
})
export class ClientWsModule {}
