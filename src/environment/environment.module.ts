import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [EnvironmentService],
  exports: [EnvironmentService],
  imports: [ConfigModule],
})
export class EnvironmentModule {}
