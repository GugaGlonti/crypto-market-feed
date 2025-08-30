import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Admin, Kafka, Partitioners, Producer } from 'kafkajs';
import { EnvironmentService } from '../environment/environment.service';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;

  constructor(private readonly env: EnvironmentService) {
    this.kafka = new Kafka({
      clientId: 'crypto-market-feed',
      brokers: [env.requiredString('KAFKA_BROKER')],
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
    this.admin = this.kafka.admin({});
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendMessage(
    topic: string,
    message: any,
    options?: {
      key?: string;
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    },
  ) {
    const value = JSON.stringify(message);
    const timestamp = Date.now().toString();
    const { key } = options || {};

    await this.producer.send({
      topic,
      messages: [{ key: key || null, value, timestamp }],
    });
  }

  async createTopic(topic: string, numPartitions = 1, replicationFactor = 1) {
    await this.admin.connect();

    const existingTopics = await this.admin.listTopics();
    if (existingTopics.includes(topic)) {
      this.logger.log(`Topic ${topic} already exists`);
      return await this.admin.disconnect();
    }

    await this.admin.createTopics({
      topics: [
        {
          topic,
          numPartitions,
          replicationFactor,
          configEntries: [{ name: 'cleanup.policy', value: 'delete' }],
        },
      ],
    });

    await this.admin.disconnect();
  }
}
