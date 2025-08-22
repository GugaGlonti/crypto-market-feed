export interface BinanceTrade {
  eventType: string;
  eventTime: number;
  symbol: string;
  tradeId: number;
  price: string;
  quantity: string;
  tradeTime: number;
  isBuyermaker: boolean;
  ignore: boolean;
}
