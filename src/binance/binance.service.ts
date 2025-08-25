import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { StreamsService } from '../streams/streams.service';
import { EnvironmentService } from './../environment/environment.service';
import { BinanceTrade } from './dto/binance-trade.dto';
import { BinanceTradeEvent } from './events/binance-trade.event';
import { BinanceTradePipe } from './pipes/binance-trade.pipe';

@Injectable()
export class BinanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BinanceService.name);
  private binanceUrl: string;
  private binanceTrades: string;

  constructor(
    private readonly streamsService: StreamsService,
    private readonly binanceTradePipe: BinanceTradePipe,
    private readonly environmentService: EnvironmentService,
  ) {
    this.binanceUrl = this.environmentService.requiredString('BINANCE_URL');
    this.binanceTrades =
      this.environmentService.requiredString('BINANCE_TRADES');
  }

  onModuleInit() {
    this.logger.log(
      `Connecting to Binance: ${this.binanceUrl}/${this.binanceTrades}`,
    );
    this.streamsService.registerStream<BinanceTradeEvent>(
      'binance',
      `${this.binanceUrl}/${this.binanceTrades}`,
      this.handleBinanceStream.bind(this),
    );
  }

  onModuleDestroy() {
    this.logger.log(
      `Disconnecting from Binance: ${this.binanceUrl}/${this.binanceTrades}`,
    );
    this.streamsService.unregisterStream('binance');
  }

  private handleBinanceStream(data: BinanceTradeEvent) {
    const binanceTrade: BinanceTrade = this.binanceTradePipe.transform(data);
    this.logger.log(`Received trade: ${JSON.stringify(binanceTrade)}`);
  }
}
