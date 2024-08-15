import { ICompactCandlestickRecords } from '../candlestick/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Exchange Service
 * Object in charge of brokering the communication with the Exchanges' APIs.
 */
type IExchangeService = {
  // properties
  CANDLESTICK_INTERVALS: ICandlestickInterval[];

  // market data
  getCandlesticks: IGetCandlesticks;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                            METHODS                                             *
 ************************************************************************************************ */

// getCandlesticks
type IGetCandlesticks = (
  interval: ICandlestickInterval,
  limit: number,
  startTime?: number,
) => Promise<ICompactCandlestickRecords>;





/* ************************************************************************************************
 *                                          CANDLESTICK                                           *
 ************************************************************************************************ */

/**
 * Candlestick Interval
 * The duration of each candlestick period (supported by all exchanges).
 */
type ICandlestickInterval =
'1m' | '5m' | '15m' | '30m' | // minutes
'1h' | // hours
'1d' | // days
'1w'; // weeks





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IExchangeService,

  // methods
  IGetCandlesticks,

  // candlestick
  ICandlestickInterval,
};
