import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { EnvironmentModule } from '../environment/environment.module';

@Module({
  exports: [KafkaService],
  providers: [KafkaService],
  imports: [EnvironmentModule],
})
export class KafkaModule {}
