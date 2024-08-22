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
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IBitfinexService,

  // candlestick
  IBitfinexCandlestickInterval,
  IBitfinexCandlestick,
  ISupportedCandlestickIntervals,
};
