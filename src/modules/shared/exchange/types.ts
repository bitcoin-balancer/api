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
  getOrderBook: IGetOrderBook;
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

// getOrderBook
type IGetOrderBook = () => Promise<IOrderBook>;

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
 *                                           ORDER BOOK                                           *
 ************************************************************************************************ */

/**
 * Order Book
 * The current state of the order book for the base asset.
 */
type IOrderBook = {
  // asks (sell orders)
  asks: Array<[
    number, // price
    number, // quantity
  ]>;

  // bids (buy orders)
  bids: Array<[
    number, // price
    number, // quantity
  ]>;
};





/* ************************************************************************************************
 *                                             TICKER                                             *
 ************************************************************************************************ */

/**
 * Ticker
 * The object that is broadcasted via the ticker stream and contains the price for symbols that
 * have experienced changes. e.g. { 'BTC': 61555.65, 'ETH': 2455.21 }
 */
type ITickerWebSocketMessage = IRecord<number>;





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IExchangeService,

  // methods
  IGetCandlesticks,
  IGetOrderBook,
  IGetTopSymbols,
  IGetTickersStream,

  // candlestick
  ICandlestickInterval,

  // order book
  IOrderBook,

  // ticker
  ITickerWebSocketMessage,
};
