

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Kraken Service
 * Object in charge of exposing Kraken's API in a modular manner.
 */
type IKrakenService = {

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
 * GET https://api-pub.bitfinex.com/v2/candles/{candle}/{section}
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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IKrakenService,

  // candlestick
  IKrakenCandlestickInterval,
  IKrakenCandlestick,
};
