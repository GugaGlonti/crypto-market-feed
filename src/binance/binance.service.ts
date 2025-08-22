import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class BinanceService implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    console.log('BinanceService initialized');
  }

  onModuleDestroy() {
    console.log('BinanceService destroyed');
  }
}
