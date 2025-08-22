import { OnModuleInit } from './../../node_modules/@nestjs/common/interfaces/hooks/on-init.interface.d';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { StreamsService } from '../streams/streams.service';
import { BinanceTradeEvent } from './events/binance-trade.event';
import { BinanceTrade } from './dto/binance-trade.dto';
import { BinanceTradePipe } from './pipes/binance-trade.pipe';

@Injectable()
export class BinanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BinanceService.name);

  private readonly binanceUrl = 'wss://stream.binance.com:9443/ws';
  private readonly trades = ['ltcusdt@trade'];

  constructor(
    private readonly streamsService: StreamsService,
    private readonly binanceTradePipe: BinanceTradePipe,
  ) {}

  onModuleInit() {
    this.streamsService.registerStream<BinanceTradeEvent>(
      'binance',
      `${this.binanceUrl}/${this.trades.join(`/`)}`,
      this.handleBinanceStream.bind(this),
    );
  }

  onModuleDestroy() {
    this.streamsService.unregisterStream('binance');
  }

  private handleBinanceStream(data: BinanceTradeEvent) {
    const binanceTrade: BinanceTrade = this.binanceTradePipe.transform(data);
    this.logger.log(`Received trade: ${JSON.stringify(binanceTrade)}`);
  }
}
