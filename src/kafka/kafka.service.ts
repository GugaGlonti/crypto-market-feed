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
    this.logger.log('Initializing KafkaService...');
    this.kafka = new Kafka({
      clientId: 'crypto-market-feed',
      brokers: [env.requiredString('KAFKA_BROKER')],
    });
    this.logger.log('Initializing Kafka producer...');
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
    this.logger.log('Initializing Kafka admin...');
    this.admin = this.kafka.admin({});
  }

  async onModuleInit() {
    this.logger.log('Connecting to Kafka broker...');
    await this.producer.connect();
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Kafka broker...');
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
    await this.producer.send({
      topic,
      messages: [
        {
          key: options?.key || null,
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    });
  }

  async createTopic(topic: string, numPartitions = 1, replicationFactor = 1) {
    this.logger.log(`Creating Kafka topic: ${topic}`);

    this.logger.log(`Connecting admin client...`);
    await this.admin.connect();

    this.logger.log(`Checking if topic ${topic} exists...`);
    const existingTopics = await this.admin.listTopics();
    if (existingTopics.includes(topic)) {
      this.logger.log(`Topic ${topic} already exists`);
      return await this.admin.disconnect();
    }

    this.logger.log(`Creating topic ${topic}...`);
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

    this.logger.log(`Topic ${topic} created successfully`);
    this.logger.log(`Disconnecting admin client...`);
    await this.admin.disconnect();
  }
}
