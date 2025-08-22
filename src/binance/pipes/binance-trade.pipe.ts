import { Injectable, PipeTransform } from '@nestjs/common';
import { BinanceTradeEvent } from '../events/binance-trade.event';
import { BinanceTrade } from '../dto/binance-trade.dto';

@Injectable()
export class BinanceTradePipe
  implements PipeTransform<BinanceTradeEvent, BinanceTrade>
{
  transform(value: BinanceTradeEvent): BinanceTrade {
    return {
      eventType: value.e,
      eventTime: value.E,
      symbol: value.s,
      tradeId: value.t,
      price: value.p,
      quantity: value.q,
      tradeTime: value.T,
      isBuyermaker: value.m,
      ignore: value.M,
    };
  }
}
