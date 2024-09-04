import { Observable } from 'rxjs';
import { IRecord } from '../../types.js';
import { ICompactCandlestickRecords } from '../../../candlestick/index.js';
import {
  ICandlestickInterval,
  IOrderBook,
  IOrderBookWebSocketMessage,
  ITickerWebSocketMessage,
} from '../types.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Bitfinex Service
 * Object in charge of exposing Bitfinex's API in a modular manner.
 */
type IBitfinexService = {
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
};





/* ************************************************************************************************
 *                                           WEBSOCKET                                            *
 ************************************************************************************************ */

/**
 * Bitfinex Channel ID
 * Utility type to differentiate IDs from traditional numbers.
 */
type IBitfinexChannelID = number;

/**
 * Bitfinex WebSocket Channel
 * The name of the channel the API subscribed to.
 */
type IBitfinexWebSocketChannel = 'book' | 'ticker';

/**
 * Bitfinex WebSocket Event
 * The action being executed to interact with the stream.
 */
type IBitfinexWebSocketEvent = 'error' | 'info' | 'subscribe' | 'subscribed';

/**
 * Bitfinex Info WebSocket Message
 * The object sent by the stream when the connection is established.
 */
type IBitfinexInfoWebSocketMessage = {
  event: 'info',
  version: number; // e.g. 2
  serverId: string; // e.g. '517720c6-d168-4be6-b720-f44c7eb9877e'
  platform: IRecord<unknown>; // e.g. { status: 1 }
};

/**
 * Bifinex Heartbeat WebSocket Message
 * The object sent every certain period of time to ensure there is a healthy connection to the
 * stream.
 */
type IBitfinexHeartbeatWebSocketMessage = [IBitfinexChannelID, 'hb'];

/**
 * Bitfinex WebSocket Message
 * The possible objects that are sent when subscribing to the on('message') event.
 */
type IBitfinexWebSocketMessage = IBitfinexInfoWebSocketMessage | IBitfinexHeartbeatWebSocketMessage
| IBitfinexTickerSubscriptionMessage | IBitfinexOrderBookWebSocketMessage
| IBitfinexTickerWebSocketMessage;





/* ************************************************************************************************
 *                                          CANDLESTICK                                           *
 ************************************************************************************************ */

/**
 * Bitfinex Candlestick Interval
 * The candlestick intervals supported by Bitfinex.
 */
type IBitfinexCandlestickInterval =
'1m' | '5m' | '15m' | '30m' | // minutes
'1h' | '3h' | '6h' | '12h' | // hours
'1D' | '14D' | // days
'1W' | // weeks
'1M'; // months

/**
 * Bitfinex Candlestick
 * The Kline object retrieved from Bitfinex's API.
 * GET https://api-pub.bitfinex.com/v2/candles/{candle}/{section}
 */
type IBitfinexCandlestick = [
  number, // 0 = open time  e.g. 1638122400000
  number, // 1 = open       e.g. 59056
  number, // 2 = close      e.g. 59057
  number, // 3 = high       e.g. 59060
  number, // 4 = low        e.g. 59041
  number, // 5 = volume     e.g. 0.25133369
];

/**
 * Supported Candlestick Intervals
 * Object containing the supported candlestick intervals as well as the Bitfinex equivalent.
 */
type ISupportedCandlestickIntervals = {
  [key in ICandlestickInterval]: IBitfinexCandlestickInterval;
};





/* ************************************************************************************************
 *                                           ORDER BOOK                                           *
 ************************************************************************************************ */

/**
 * Bitfinex Order Book Level
 * The tuple that contains the information for an individual price level.
 */
type IBitfinexOrderBookLevel = [
  number, // 0: price (price level)
  number, // 1: count (number of orders at the price level)
  number, // 2: amount (total amount available at that price lvl - if AMOUNT > 0 then bid else ask)
];

/**
 * Bitfinex Order Book
 * The current state of the order book for the base asset.
 * GET https://api-pub.bitfinex.com/v2/book/{symbol}/{precision}
 */
type IBitfinexOrderBook = Array<IBitfinexOrderBookLevel>;

/**
 * Bitfinex Order Book WebSocket Subscription
 * The object that will be sent in a message in order to subscribe to the order book stream.
 * More info: https://docs.bitfinex.com/reference/ws-public-books
 */
type IBitfinexOrderBookWebSocketSubscription = {
  event: IBitfinexWebSocketEvent; // e.g. 'subscribe'
  channel: IBitfinexWebSocketChannel; // e.g. 'book'
  symbol: string; // e.g. 'tBTCUSD'
  prec: string; // e.g. 'PO'
  len: number; // e.g. 250
  freq: string, // 'FO'
};

/**
 * Bitfinex Order Book WebSocket Message
 * The object sent by the stream whenever the base asset's order book changes.
 * The array of levels is only received on subscription, following events will include an individual
 * tuple.
 */
type IBitfinexOrderBookWebSocketMessage = [
  IBitfinexChannelID,
  Array<IBitfinexOrderBookLevel> | IBitfinexOrderBookLevel,
];





/* ************************************************************************************************
 *                                             TICKER                                             *
 ************************************************************************************************ */

/**
 * Bitfinex Coin Ticker
 * The 24 hour rolling window price change statistics.
 * GET https://api-pub.bitfinex.com/v2/tickers
 */
type IBitfinexCoinTicker = [
  string, // 0: the symbol of the requested ticker data                             e.g. "tETHUSD
  number, // 1: price of last highest bid                                           e.g. 2667.9
  number, // 2: sum of the 25 highest bid sizes                                     e.g. 227.1685628
  number, // 3: price of last lowest ask                                            e.g. 2668
  number, // 4: sum of the 25 lowest ask sizes                                      e.g. 348.8036471
  number, // 5: amount that the last price has changed since yesterday              e.g. 36.8
  number, // 6: relative price change since yesterday (*100 for percentage change)  e.g. 0.01399293
  number, // 7: price of the last trade                                             e.g. 2666.7
  number, // 8: daily volume                                                        e.g. 1657.337749
  number, // 9: daily high                                                          e.g. 2694
  number, // 10: daily low                                                          e.g. 2595.2
];

/**
 * Bitfinex Ticker WebSocket Subscription
 * The object that will be sent in a message in order to subscribe to the ticker stream. More info:
 * https://docs.bitfinex.com/reference/ws-public-ticker
 */
type IBitfinexTickerWebSocketSubscription = {
  event: IBitfinexWebSocketEvent; // e.g. 'subscribe'
  channel: IBitfinexWebSocketChannel; // e.g. 'ticker'
  symbol: string; // e.g. 'tBTCUSD'
};

/**
 * Bitfinex Ticker Susbcription Message
 * The object sent by the stream when a subscription to a channel is successful.
 */
type IBitfinexTickerSubscriptionMessage = {
  event: 'subscribed';
  channel: IBitfinexWebSocketChannel;
  chanId: IBitfinexChannelID; // e.g. 662780
  symbol: string; // e.g. 'tBTCUSD'
  pair: string; // e.g. 'BTCUSD'
};

/**
 * Bitfinex Ticker WebSocket Message
 * The object sent by the stream whenever a trade is executed for a top symbol.
 */
type IBitfinexTickerWebSocketMessageData = [
  number, // 0: price of last highest bid . e.g. 64055
  number, // 1: sum of the 25 highest bid sizes . e.g. 7.9772258
  number, // 2: price of last lowest ask . e.g. 64056
  number, // 3: sum of the 25 lowest ask sizes . e.g. 7.2144803
  number, // 4: amount that the last price has changed since yesterday . e.g. 2316
  number, // 5: relative price change since yesterday (*100 for percentage change) . e.g. 0.03751215
  number, // 6: price of the last trade. e.g. 64056
  number, // 7: daily volume . e.g. 584.77979901
  number, // 8: daily high . e.g. 65074
  number, // 9: daily low . e.g. 61472
];
type IBitfinexTickerWebSocketMessage = [IBitfinexChannelID, IBitfinexTickerWebSocketMessageData];





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IBitfinexService,

  // websocket
  IBitfinexWebSocketMessage,

  // candlestick
  IBitfinexCandlestickInterval,
  IBitfinexCandlestick,
  ISupportedCandlestickIntervals,

  // order book
  IBitfinexOrderBook,
  IBitfinexOrderBookLevel,
  IBitfinexOrderBookWebSocketSubscription,
  IBitfinexOrderBookWebSocketMessage,

  // ticker
  IBitfinexCoinTicker,
  IBitfinexTickerWebSocketSubscription,
  IBitfinexTickerWebSocketMessageData,
};
