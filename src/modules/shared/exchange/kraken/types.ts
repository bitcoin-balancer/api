import { Observable } from 'rxjs';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import {
  ICandlestickInterval,
  IOrderBook,
  ITickerWebSocketMessage,
} from '../types.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Kraken Service
 * Object in charge of exposing Kraken's API in a modular manner.
 */
type IKrakenService = {
  // properties
  // ...

  // market data
  getCandlesticks: (
    interval: ICandlestickInterval,
    limit: number,
    startTime?: number,
  ) => Promise<ICompactCandlestickRecords>;
  getOrderBook: () => Promise<IOrderBook>;
  getTopSymbols: (whitelistedSymbols: string[], limit: number) => Promise<string[]>;
  getTickersStream: (topSymbols: string[]) => Observable<ITickerWebSocketMessage>;
};





/* ************************************************************************************************
 *                                         API RESPONSE                                           *
 ************************************************************************************************ */

/**
 * Kraken API Response
 * The exchange doesn't make use of HTTP error codes. Instead, it provides two top-level keys
 * (result & error).
 * Unsuccessful requests will only contain the error property while the successful ones will contain
 * both, result and error (it may include warnings in successful requests).
 * https://docs.kraken.com/rest/#section/General-Usage
 */
type IKrakenAPIResponse = {
  // the list of errors or warnings
  error: string[];

  // the data retrieved from the API
  result: any;
};





/* ************************************************************************************************
 *                                           WEBSOCKET                                            *
 ************************************************************************************************ */

/**
 * Kraken WebSocket Channel
 * The name of the channel the API subscribed to. The following channels are always present:
 * status: https://docs.kraken.com/api/docs/websocket-v2/status
 * heartbeat: https://docs.kraken.com/api/docs/websocket-v2/heartbeat
 */
type IKrakenWebSocketChannel = 'status' | 'heartbeat' | 'ticker';

/**
 * Kraken WebSocket Method
 * The method that will be used to interact with the stream.
 */
type IKrakenWebSocketMethod = 'subscribe';

/**
 * Kraken WebSocket Message Type
 * The snapshot type is generally received upon subscription. Future changes will have the
 * 'update' type.
 */
type IKrakenWebSocketMessageType = 'snapshot' | 'update';

/**
 * Kraken WebSocket Subscription Result
 * The object sent when a subscription is attempted. If success is true, the connection is live.
 */
type IKrakenWebSocketSubscriptionResult = {
  'method': IKrakenWebSocketMethod,
  'result': IKrakenTickerWebSocketSubscriptionParams, // params used to subscribe to channel
  'success': boolean; // e.g. true
  'time_in': string; // e.g. '2024-08-24T13:54:49.279970Z'
  'time_out': string; // e.g. '2024-08-24T13:54:49.280032Z'
};

/**
 * Kraken WebSocket Message
 * The message objects sent by Kraken's stream.
 */
type IKrakenWebSocketMessage = {
  channel: IKrakenWebSocketChannel;
} & (
  | {
    channel: 'heartbeat';
  }
  | IKrakenStatusWebSocketMessage
  | IKrakenTickerWebSocketMessage
);

/**
 * Kraken Status WebSocket Message
 * The object that is sent when subscribing to the 'status' channel or the very first message
 * when subscribing to any other channel.
 */
type IKrakenStatusWebSocketMessage = {
  channel: 'status';
  data: [
    {
      api_version: string; // e.g. 'v2'
      connection_id: number; // e.g. 13641401588741292028
      system: string; // e.g. 'online'
      version: string; // e.g. '2.0.8'
    },
  ],
  type: IKrakenWebSocketMessageType; // e.g. 'update'
};





/* ************************************************************************************************
 *                                          CANDLESTICK                                           *
 ************************************************************************************************ */

/**
 * Kraken Candlestick Interval
 * The candlestick intervals supported by Kraken.
 */
type IKrakenCandlestickInterval =
1 | 5 | 15 | 30 | // minutes
60 | 240 | // hours
1440 | // days
10080 | 21600; // weeks

/**
 * Kraken Candlestick
 * The Kline object retrieved from Kraken's API.
 * GET https://api.kraken.com/0/public/OHLC
 */
type IKrakenCandlestick = [
  number, // 0 = open time  e.g. 1688671200 (seconds)
  string, // 1 = open       e.g. "58993.5"
  string, // 2 = high       e.g. "59014.2"
  string, // 3 = low        e.g. "58961.0"
  string, // 4 = close      e.g. "58995.0"
  string, // 4 = vwap       e.g. "58992.8"
  string, // 5 = volume     e.g. "2.11998256"
  number, // 5 = count      e.g. 162
];

/**
 * Supported Candlestick Intervals
 * Object containing the supported candlestick intervals as well as the Kraken equivalent.
 */
type ISupportedCandlestickIntervals = {
  [key in ICandlestickInterval]: IKrakenCandlestickInterval;
};





/* ************************************************************************************************
 *                                           ORDER BOOK                                           *
 ************************************************************************************************ */

/**
 * Kraken Order Book Level
 * The tuple that contains the information for an individual price level.
 */
type IKrakenOrderBookLevel = [
  string, // price
  string, // volume
  number, // timestamp
];

/**
 * Kraken Order Book
 * The current state of the order book for the base asset.
 * GET https://api.kraken.com/0/public/Depth?pair=XBTUSD&count=500
 */
type IKrakenOrderBook = {
  // asks (sell orders)
  asks: Array<IKrakenOrderBookLevel>;

  // bids (buy orders)
  bids: Array<IKrakenOrderBookLevel>;
};





/* ************************************************************************************************
 *                                             TICKER                                             *
 ************************************************************************************************ */

/**
 * Kraken Coin Ticker
 * The 24 hour rolling window price change statistics.
 * GET https://api.kraken.com/0/public/Ticker
 */
type IKrakenCoinTickers = {
  [pair: string]: IKrakenCoinTicker;
};
type IKrakenCoinTicker = {
  a: [string, string, string]; // ask
  b: [string, string, string]; // bid
  c: [string, string]; // last trade closed
  v: [string, string]; // volume
  p: [string, string]; // volume weighted average price
  t: [number, number]; // number of trades
  l: [string, string]; // low
  h: [string, string]; // high
  o: string; // today's opening price
};

/**
 * Kraken Ticker WebSocket Subscription
 * The object that will be sent in a message in order to subscribe to the ticker stream. More info:
 * https://docs.kraken.com/api/docs/websocket-v2/ticker
 */
type IKrakenTickerWebSocketSubscriptionParams = {
  channel: IKrakenWebSocketChannel;
  symbol: string[];
  event_trigger: 'bbo' | 'trades';
  snapshot: true;
};
type IKrakenTickerWebSocketSubscription = {
  method: IKrakenWebSocketMethod;
  params: IKrakenTickerWebSocketSubscriptionParams;
};

/**
 * Kraken Ticker WebSocket Message
 * This object is received from the stream whenever a trade is executed for a symbol the API is
 * subscribed to.
 */
type IKrakenTickerWebSocketMessageData = {
  symbol: string; // e.g. 'BTC/USD'
  bid: number; // e.g. 64258.3
  bid_qty: number; // e.g. 0.50598910
  ask: number; // e.g. 64258.4
  ask_qty: number; // e.g. 24.24969048
  last: number; // e.g. 64258.4
  volume: number; // e.g. 3119.69182266
  vwap: number; // e.g. 63071.4
  low: number; // e.g. 60795.6
  high: number; // e.g. 64950.9
  change: number; // e.g. 3207.7
  change_pct: number; // e.g. 5.25
};
type IKrakenTickerWebSocketMessage = {
  channel: 'ticker';
  data: [IKrakenTickerWebSocketMessageData],
  type: IKrakenWebSocketMessageType; // e.g. 'snapshot'
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IKrakenService,

  // api response
  IKrakenAPIResponse,

  // websocket
  IKrakenWebSocketMessage,
  IKrakenWebSocketSubscriptionResult,

  // candlestick
  IKrakenCandlestickInterval,
  IKrakenCandlestick,
  ISupportedCandlestickIntervals,

  // order book
  IKrakenOrderBookLevel,
  IKrakenOrderBook,

  // ticker
  IKrakenCoinTickers,
  IKrakenCoinTicker,
  IKrakenTickerWebSocketSubscription,
  IKrakenTickerWebSocketMessageData,
};
