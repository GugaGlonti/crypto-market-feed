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
    this.logger.log('Initializing BinanceService...');

    this.logger.log('Creating Kafka topic: binance_trades');
    await this.kafkaService.createTopic('binance_trades');

    this.logger.log('Registering Binance stream and binding handler...');
    await this.streamsService.registerStream<BinanceTradeEvent>(
      'binance',
      `${this.binanceUrl}/${this.binanceTrades}`,
      this.handleBinanceStream.bind(this),
    );
  }

  onModuleDestroy() {
    const url = `${this.binanceUrl}/${this.binanceTrades}`;
    this.logger.log(`Disconnecting from Binance: ${url}`);
    this.streamsService.unregisterStream('binance');
  }

  private async handleBinanceStream(data: BinanceTradeEvent): Promise<void> {
    const binanceTrade: BinanceTrade = this.binanceTradePipe.transform(data);
    await this.kafkaService.sendMessage('binance_trades', binanceTrade);
    this.incrementMessagesSent();
  }

  private messagesSent: bigint = BigInt(0);
  private smallIncrement: number = 0;
  private readonly SMALL_INCREMENT_THRESHOLD = 100;

  private incrementMessagesSent(): void {
    this.smallIncrement += 1;
    if (this.smallIncrement >= this.SMALL_INCREMENT_THRESHOLD) {
      this.messagesSent += BigInt(this.SMALL_INCREMENT_THRESHOLD);
      this.smallIncrement = 0;
      this.logger.log(`Messages sent: ${this.messagesSent}`);
    }
  }
}
