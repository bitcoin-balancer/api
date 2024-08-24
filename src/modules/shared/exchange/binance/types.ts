import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { ICandlestickInterval } from '../types.js';

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
  getTopCoins: (whitelistedSymbols: string[], limit: number) => Promise<string[]>;
};





/* ************************************************************************************************
 *                                           WEBSOCKET                                            *
 ************************************************************************************************ */

/**
 * Binance Websocket Message
 * The possible objects that are sent when subscribing to the on('message') event.
 */
type IBinanceWebsocketMessage = IBinanceTickerWebsocketMessage;





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

// ...




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
 * Binance Ticker Websocket Message
 * The object sent by the stream whenever a trade is executed for a top symbol.
 */
type IBinanceTickerWebsocketMessageData = {
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
type IBinanceTickerWebsocketMessage = IBinanceTickerWebsocketMessageData[];





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IBinanceService,

  // websocket
  IBinanceWebsocketMessage,

  // candlestick
  IBinanceCandlestickInterval,
  IBinanceCandlestick,

  // order book
  // ...

  // ticker
  IBinanceCoinTicker,
  IBinanceTickerWebsocketMessage,
};
