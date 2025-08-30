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
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class BinanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BinanceService.name);
  private binanceUrl: string;
  private binanceTrades: string;

  constructor(
    private readonly streamsService: StreamsService,
    private readonly binanceTradePipe: BinanceTradePipe,
    private readonly env: EnvironmentService,
    private readonly kafkaService: KafkaService,
  ) {
    this.binanceUrl = this.env.requiredString('BINANCE_URL');
    this.binanceTrades = this.env.requiredString('BINANCE_TRADES');
  }

  async onModuleInit() {
    await this.kafkaService.createTopic('binance_trades');
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
    this.logger.log(
      `For incoming trade: ${JSON.stringify(binanceTrade)} to Kafka`,
    );
    this.kafkaService
      .sendMessage('binance_trades', binanceTrade)
      .then(() =>
        this.logger.log(`Sent trade to Kafka: ${JSON.stringify(binanceTrade)}`),
      )
      .catch((error) => {
        this.logger.error(`Failed to send trade to Kafka: ${error}`);
      });
  }
}
