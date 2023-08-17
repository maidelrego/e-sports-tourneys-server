import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';

@Module({
  controllers: [],
  providers: [EmailService],
  imports: [],
  exports: [EmailService, TypeOrmModule],
})
export class EmailModule {}
