import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinanceModule } from './binance/binance.module';
import { StreamsService } from './streams/streams.service';
import { StreamsModule } from './streams/streams.module';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentService } from './environment/environment.service';
import { EnvironmentModule } from './environment/environment.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    BinanceModule,
    StreamsModule,
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    EnvironmentModule,
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService, StreamsService, EnvironmentService],
})
export class AppModule {}
