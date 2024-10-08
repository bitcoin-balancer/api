import { Observable } from 'rxjs';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import {
  ICandlestickInterval,
  IOrderBook,
  IOrderBookWebSocketMessage,
  ITickerWebSocketMessage,
  IBalances,
  ITrade,
} from '../types.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Binance Service
 * Object in charge of exposing Binance's API in a modular manner.
 */
type IBinanceService = {
  // properties
  // ...

  // market data
  getCandlesticks: (
    interval: ICandlestickInterval,
    limit: number,
    startTime?: number,
  ) => Promise<ICompactCandlestickRecords>;
  getOrderBook: () => Promise<IOrderBook>;
  getOrderBookStream: () => Observable<IOrderBookWebSocketMessage>;
  getTopSymbols: (whitelistedSymbols: string[], limit: number) => Promise<string[]>;
  getTickersStream: (topSymbols: string[]) => Observable<ITickerWebSocketMessage>;

  // account data
  getBalances: () => Promise<IBalances>;
  listTrades: (startAt: number) => Promise<ITrade[]>;

  // account actions
  buy: (amount: number) => Promise<IBinanceOrderExecutionResponse>;
  sell: (amount: number) => Promise<IBinanceOrderExecutionResponse>;
};





/* ************************************************************************************************
 *                                           WEBSOCKET                                            *
 ************************************************************************************************ */

/**
 * Binance WebSocket Message
 * The possible objects that are sent when subscribing to the on('message') event.
 */
type IBinanceWebSocketMessage = IBinanceTickerWebSocketMessage;





/* ************************************************************************************************
 *                                            GENERAL                                             *
 ************************************************************************************************ */

/**
 * Binance Side
 * The kind of action executed by the account.
 * BUY stands for buying the base asset (e.g. USDT -> BTC)
 * SELL stands for selling the base asset (e.g. BTC -> USDT)
 */
type IBinanceSide = 'BUY' | 'SELL';





/* ************************************************************************************************
 *                                          CANDLESTICK                                           *
 ************************************************************************************************ */

/**
 * Binance Candlestick Interval
 * The candlestick intervals supported by Binance.
 */
type IBinanceCandlestickInterval =
'1s' | // seconds
'1m' | '3m' | '5m' | '15m' | '30m' | // minutes
'1h' | '2h' | '4h' | '6h' | '8h' | '12h' | // hours
'1d' | '3d' | // days
'1w' | // weeks
'1m'; // months

/**
 * Binance Candlestick
 * The Kline object retrieved from Binance's API.
 * GET /api/v3/klines
 */
type IBinanceCandlestick = [
  number, // 0 = open time                        e.g. 1638122400000
  string, // 1 = open                             e.g. "53896.36000000"
  string, // 2 = high                             e.g. "54186.17000000"
  string, // 3 = low                              e.g. "53256.64000000"
  string, // 4 = close                            e.g. "54108.99000000"
  string, // 5 = volume                           e.g. "2958.13310000"
  number, // 6 = close time                       e.g. 1638125999999
  string, // 7 = quote asset volume               e.g. "158995079.39633250"
  number, // 8 = number of trades                 e.g. 90424
  string, // 9 = taker buy base asset volume      e.g. "1473.57777000"
  string, // 10 = taker buy quote asset volume    e.g. "79236207.41530900"
  string, // 11 = unused field, ignore
];





/* ************************************************************************************************
 *                                           ORDER BOOK                                           *
 ************************************************************************************************ */

/**
 * Binance Order Book
 * The current state of the order book for the base asset.
 * GET /api/v3/depth
 */
type IBinanceOrderBook = {
  // asks (sell orders)
  asks: Array<[
    string, // price
    string, // quantity
  ]>;

  // bids (buy orders)
  bids: Array<[
    string, // price
    string, // quantity
  ]>;

  // binance internals
  lastUpdateId: number;
};

/**
 * Binance Order Book WebSocket Message
 * The object sent by the stream whenever the orders change.
 * https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
 */
type IBinanceOrderBookWebSocketMessage = {
  // event type
  e: string; // "depthUpdate"

  // event time
  E: number; // 1725111742114

  // symbol
  s: string; // "BTCUSDT"

  // first update ID in event
  U: number; // 51044631856

  // final update ID in event
  u: number; // 51044631864

  // asks to be updated
  a: Array<[
    string, // price level to be updated
    string, // quantity
  ]>; // [["59177.00000000", "5.25143000"], ...]

  // bids to be updated
  b: Array<[
    string, // price level to be updated
    string, // quantity
  ]>; // [["59164.28000000", "0.00000000"], ...]
};





/* ************************************************************************************************
 *                                             TICKER                                             *
 ************************************************************************************************ */

/**
 * Binance Coin Ticker
 * The 24 hour rolling window price change statistics.
 * GET /api/v3/ticker/24hr
 */
type IBinanceCoinTicker = {
  symbol: string; // trading pair                                         e.g. "ETHUSDT"
  openPrice: string; // the price 24h ago                                 e.g. "2625.00000000"
  highPrice: string; // the highest price in the last 24h                 e.g. "2689.00000000"
  lowPrice: string; // the lowest price in the last 24h                   e.g. "2590.50000000"
  lastPrice: string; // the last traded price                             e.g. "2665.81000000"
  volume: string; // the 24h volume in base asset                         e.g. "239064.08200000"
  quoteVolume: string; // the 24h volume in quote asset                   e.g. "631427670.76268000"
  openTime: number; // the timestamp (ms) of the beginning of the ticker  e.g. 1724331055499
  closeTime: number; // the time (ms) at which the ticket will close      e.g. 1724417455499
  firstId: number; // trade ID of the first trade in the interval         e.g. 1538342959
  lastId: number; // trade ID of the last trade in the interval           e.g. 1539402424
  count: number; // the number of trades in the interval                  e.g. 1059466
};

/**
 * Binance Ticker WebSocket Message
 * The object sent by the stream whenever a trade is executed for a top symbol.
 */
type IBinanceTickerWebSocketMessageData = {
  e: string; // event type. e.g. '24hrMiniTicker'
  E: number; // event time. e.g. 1724518380063
  s: string; // symbol. e.g. 'ETHUSDT'
  c: string; // close price. e.g. '2810.07000000'
  o: string; // open price. e.g. '2674.70000000'
  h: string; // high price. e.g. '2820.00000000'
  l: string; // low price. e.g. '2670.32000000'
  v: string; // total traded base asset volume. e.g. '335374.51790000'
  q: string; // total traded quote asset volume. e.g. '923325368.12662400'
};
type IBinanceTickerWebSocketMessage = IBinanceTickerWebSocketMessageData[];





/* ************************************************************************************************
 *                                          ACCOUNT DATA                                          *
 ************************************************************************************************ */

/**
 * Binance Account Balance
 * The object containing the balance details and its state for a symbol.
 */
type IBinanceAccountBalance = {
  asset: string; // "BTC"
  free: string; // "4723846.89208129"
  locked: string; // "0.00000000"
};

/**
 * Binance Account Information
 * All the details regarding the Binance account that is currently connected to Balancer.
 * GET /api/v3/account
 */
type IBinanceAccountInformation = {
  makerCommission: number; // 15
  takerCommission: number; // 15
  buyerCommission: number; // 0
  sellerCommission: number; // 0
  commissionRates: {
    maker: string;
    taker: string;
    buyer: string;
    seller: string;
  };
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  brokered: boolean;
  requireSelfTradePrevention: boolean;
  preventSor: boolean;
  updateTime: number; // 123456789
  accountType: string; // "SPOT"
  balances: IBinanceAccountBalance[];
  permissions: string[]; // ["SPOT"]
  uid: number; // 354937868
};

/**
 * Binance Account Trade
 * The object containing all the details for a single trade execution.
 * GET /api/v3/myTrades
 */
type IBinanceAccountTrade = {
  symbol: string; // "BNBBTC"
  id: number; // 28457
  orderId: number; // 100234
  orderListId: number; // -1
  price: string; // "4.00000100"
  qty: string; // "12.00000000"
  quoteQty: string; // "48.000012"
  commission: string; // "10.10000000"
  commissionAsset: string; // "BNB"
  time: number; // 1499865549590
  isBuyer: boolean; // true
  isMaker: boolean; // false
  isBestMatch: boolean; // true
};





/* ************************************************************************************************
 *                                        ACCOUNT ACTIONS                                         *
 ************************************************************************************************ */

/**
 * Binance Order Exection Response
 * The object returned by Binance's API when an order is fulfilled.
 * POST /api/v3/order
 */
type IBinanceOrderExecutionResponse = {
  symbol: string; // "BTCUSDT"
  orderId: number; // 28
  orderListId: number; // -1
  clientOrderId: string; // "6gCrw2kRUAF9CvJDGP16IP"
  transactTime: number; // 1507725176595
  price: string; // "0.00000000"
  origQty: string; // "10.00000000"
  executedQty: string; // "10.00000000"
  cummulativeQuoteQty: string; // "10.00000000"
  status: string; // "FILLED"
  timeInForce: string; // "GTC"
  type: string; // "MARKET"
  side: string; // "SELL"
  workingTime: number; // 1507725176595
  selfTradePreventionMode: string; // "NONE"
  fills: Array<{
    price: string; // "4000.00000000"
    qty: string; // "1.00000000"
    commission: string; // "4.00000000"
    commissionAsset: string; // "USDT"
    tradeId: number; // 56
  }>;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IBinanceService,

  // websocket
  IBinanceWebSocketMessage,

  // general
  IBinanceSide,

  // candlestick
  IBinanceCandlestickInterval,
  IBinanceCandlestick,

  // order book
  IBinanceOrderBook,
  IBinanceOrderBookWebSocketMessage,

  // ticker
  IBinanceCoinTicker,
  IBinanceTickerWebSocketMessage,

  // account data
  IBinanceAccountBalance,
  IBinanceAccountInformation,
  IBinanceAccountTrade,

  // account actions
  IBinanceOrderExecutionResponse,
};
