import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { StreamsModule } from '../streams/streams.module';
import { BinanceTradePipe } from './pipes/binance-trade.pipe';
import { EnvironmentModule } from '../environment/environment.module';

@Module({
  providers: [BinanceService, BinanceTradePipe],
  imports: [StreamsModule, EnvironmentModule],
})
export class BinanceModule {}
