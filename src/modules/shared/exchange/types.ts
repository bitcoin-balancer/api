import { Observable } from 'rxjs';
import { IRecord } from '../types.js';
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
  getTopSymbols: IGetTopSymbols;
  getTickersStream: IGetTickersStream;

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

// getTopSymbols
type IGetTopSymbols = (whitelistedSymbols: string[], limit: number) => Promise<string[]>;

// getTickersStream
type IGetTickersStream = (topSymbols: string[]) => Observable<ITickerWebSocketMessage>;





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
 *                                             TICKER                                             *
 ************************************************************************************************ */

/**
 * Ticker
 * The object that is broadcasted via the ticker stream.
 */
type ITickerWebSocketMessage = IRecord<number>; // e.g. { 'BTC': 61555.65, 'ETH': 2455.21 }





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IExchangeService,

  // methods
  IGetCandlesticks,
  IGetTopSymbols,
  IGetTickersStream,

  // candlestick
  ICandlestickInterval,

  // ticker
  ITickerWebSocketMessage,
};
