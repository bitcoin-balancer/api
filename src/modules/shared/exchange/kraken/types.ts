import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { ICandlestickInterval } from '../types.js';

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
};





/* ************************************************************************************************
 *                                            RESPONSE                                            *
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

// ...




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




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IKrakenService,

  // api response
  IKrakenAPIResponse,

  // candlestick
  IKrakenCandlestickInterval,
  IKrakenCandlestick,
  ISupportedCandlestickIntervals,

  // order book
  // ...

  // ticker
  IKrakenCoinTickers,
  IKrakenCoinTicker,
};
