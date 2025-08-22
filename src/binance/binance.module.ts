import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { StreamsModule } from '../streams/streams.module';
import { BinanceTradePipe } from './pipes/binance-trade.pipe';

@Module({
  providers: [BinanceService, BinanceTradePipe],
  imports: [StreamsModule],
})
export class BinanceModule {}
