import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import {
  Admin,
  Kafka,
  KafkaConfig,
  Partitioners,
  Producer,
  ProducerConfig,
} from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;

  private readonly kafkaConfig: KafkaConfig = {
    clientId: 'crypto-market-feed',
    brokers: ['localhost:9092'],
  };

  private readonly producerConfig: ProducerConfig = {
    createPartitioner: Partitioners.LegacyPartitioner,
  };

  async onModuleInit() {
    this.kafka = new Kafka(this.kafkaConfig);
    this.producer = this.kafka.producer(this.producerConfig);
    this.admin = this.kafka.admin();
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendMessage(topic: string, message: any, key?: string) {
    try {
      const value = JSON.stringify(message);
      const timestamp = Date.now().toString();

      await this.producer.send({
        topic,
        messages: [{ key: key || null, value, timestamp }],
      });
      this.logger.log(`Message sent successfully to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${topic}:`, error);
      throw error;
    }
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
