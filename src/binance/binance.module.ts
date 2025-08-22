import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { StreamsModule } from '../streams/streams.module';

@Module({
  providers: [BinanceService],
  imports: [StreamsModule],
})
export class BinanceModule {}
