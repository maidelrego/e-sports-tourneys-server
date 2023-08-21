import { Module } from '@nestjs/common';
import { ServerWsGateway } from './server-ws.gateway';
import { ServerWsService } from './server-ws.service';

@Module({
  providers: [ServerWsGateway, ServerWsService],
})
export class ServerWsModule {}
