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
  ) => Promise<ICompactCandlestickRecords>
};





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
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IBinanceService,

  // candlestick
  IBinanceCandlestickInterval,
  IBinanceCandlestick,
};
