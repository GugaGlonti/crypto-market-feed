import { Injectable } from '@nestjs/common';
import { StreamsService } from '../streams/streams.service';
import { BinanceTradeEvent } from './events/binance-trade.event';

@Injectable()
export class BinanceService {
  constructor(private readonly streamsService: StreamsService) {}

  private readonly binanceUrl = 'wss://stream.binance.com:9443/ws';
  private readonly trades = ['btcusdt@trade', 'btceur@trade'];

  public onModuleInit() {
    this.streamsService.registerStream<BinanceTradeEvent>(
      'binance',
      `${this.binanceUrl}/${this.trades.join(`/`)}`,
      this.handleBinanceStream.bind(this),
    );

    this.streamsService.registerStream<BinanceTradeEvent>(
      'binance',
      `${this.binanceUrl}/${this.trades.join(`/`)}`,
      this.handleBinanceStream.bind(this),
    );
  }

  public onModuleDestroy() {
    this.streamsService.unregisterStream('binance');
  }

  private handleBinanceStream(data: BinanceTradeEvent) {
    console.log(data);
  }
}
