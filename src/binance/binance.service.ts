import { Injectable, Logger } from '@nestjs/common';
import { StreamsService } from '../streams/streams.service';
import { BinanceTradeEvent } from './events/binance-trade.event';
import { BinanceTrade } from './dto/binance-trade.dto';
import { BinanceTradePipe } from './pipes/binance-trade.pipe';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);

  constructor(
    private readonly streamsService: StreamsService,
    private readonly binanceTradePipe: BinanceTradePipe,
  ) {}

  private readonly binanceUrl = 'wss://stream.binance.com:9443/ws';
  private readonly trades = ['ltcusdt@trade'];

  public onModuleInit() {
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
    const binanceTrade: BinanceTrade = this.binanceTradePipe.transform(data);
    this.logger.log(`Received trade: ${JSON.stringify(binanceTrade)}`);
  }
}
