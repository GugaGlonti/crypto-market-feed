import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinanceModule } from './binance/binance.module';
import { StreamsService } from './streams/streams.service';
import { StreamsModule } from './streams/streams.module';

@Module({
  imports: [BinanceModule, StreamsModule],
  controllers: [AppController],
  providers: [AppService, StreamsService],
})
export class AppModule {}
