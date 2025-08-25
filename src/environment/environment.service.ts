import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentService {
  private readonly logger = new Logger(EnvironmentService.name);

  constructor(private readonly configService: ConfigService) {}

  public requiredString(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      this.logger.error(`Missing required environment variable: ${key}`);
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  public requiredNumber(key: string): number {
    const value = this.configService.get<number>(key);
    if (value === undefined) {
      this.logger.error(`Missing required environment variable: ${key}`);
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  public requiredBoolean(key: string): boolean {
    const value = this.configService.get<boolean>(key);
    if (value === undefined) {
      this.logger.error(`Missing required environment variable: ${key}`);
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  public optionalString(key: string, defaultValue: string): string {
    const value = this.configService.get<string>(key);
    return value !== undefined ? value : defaultValue;
  }

  public optionalNumber(key: string, defaultValue: number): number {
    const value = this.configService.get<number>(key);
    return value !== undefined ? value : defaultValue;
  }

  public optionalBoolean(key: string, defaultValue: boolean): boolean {
    const value = this.configService.get<boolean>(key);
    return value !== undefined ? value : defaultValue;
  }
}
