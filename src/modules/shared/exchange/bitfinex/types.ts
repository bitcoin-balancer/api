import { IRecord } from '../../types.js';
import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { ICandlestickInterval } from '../types.js';

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
 * Bitfinex Websocket Channel
 * The name of the channel the API subscribed to.
 */
type IBitfinexWebsocketChannel = 'ticker';

/**
 * Bitfinex Websocket Event
 * The action being executed to interact with the stream.
 */
type IBitfinexWebsocketEvent = 'error' | 'info' | 'subscribe' | 'subscribed';

/**
 * Bitfinex Info Websocket Message
 * The object sent by the stream when the connection is established.
 */
type IBitfinexInfoWebsocketMessage = {
  event: IBitfinexWebsocketEvent,
  version: number; // e.g. 2
  serverId: string; // e.g. '517720c6-d168-4be6-b720-f44c7eb9877e'
  platform: IRecord<unknown>; // e.g. { status: 1 }
};

/**
 * Bifinex Heartbeat Websocket Message
 * The object sent every certain period of time to ensure there is a healthy connection to the
 * stream.
 */
type IBitfinexHeartbeatWebsocketMessage = [IBitfinexChannelID, 'hb'];

/**
 * Bitfinex Websocket Message
 * The possible objects that are sent when subscribing to the on('message') event.
 */
type IBitfinexWebsocketMessage = IBitfinexInfoWebsocketMessage | IBitfinexHeartbeatWebsocketMessage
| IBitfinexTickerSubscriptionMessage | IBitfinexTickerWebsocketMessage;





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

// ...




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
 * Bitfinex Ticker Websocket Subscription
 * The object that will be sent in a message in order to subscribe to the ticker stream. More info:
 * https://docs.bitfinex.com/reference/ws-public-ticker
 */
type IBitfinexTickerWebsocketSubscription = {
  event: IBitfinexWebsocketEvent; // e.g. 'subscribe'
  channel: IBitfinexWebsocketChannel; // e.g. 'ticker'
  symbol: string; // e.g. 'tBTCUSD'
};

/**
 * Bitfinex Ticker Susbcription Message
 * The object sent by the stream when a subscription to a channel is successful.
 */
type IBitfinexTickerSubscriptionMessage = {
  event: IBitfinexWebsocketEvent;
  channel: IBitfinexWebsocketChannel;
  chanId: IBitfinexChannelID; // e.g. 662780
  symbol: string; // e.g. 'tBTCUSD'
  pair: string; // e.g. 'BTCUSD'
};

/**
 * Bitfinex Ticker Websocket Message
 * The object sent by the stream whenever a trade is executed for a top symbol.
 */
type IBitfinexTickerWebsocketMessageData = [
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
type IBitfinexTickerWebsocketMessage = [IBitfinexChannelID, IBitfinexTickerWebsocketMessageData];





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IBitfinexService,

  // websocket
  IBitfinexWebsocketMessage,

  // candlestick
  IBitfinexCandlestickInterval,
  IBitfinexCandlestick,
  ISupportedCandlestickIntervals,

  // order book
  // ...

  // ticker
  IBitfinexCoinTicker,
  IBitfinexTickerWebsocketSubscription,
};
