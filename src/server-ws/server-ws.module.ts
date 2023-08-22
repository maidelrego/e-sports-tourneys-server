import { Module } from '@nestjs/common';
import { ServerWsGateway } from './server-ws.gateway';
import { ServerWsService } from './server-ws.service';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ServerWsGateway, ServerWsService],
  exports: [ServerWsService],
})
export class ServerWsModule {}
