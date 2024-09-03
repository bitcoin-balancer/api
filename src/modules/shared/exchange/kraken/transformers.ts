import { toMilliseconds } from '../../utils/index.js';
import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../candlestick/index.js';
import {
  IOrderBook,
  ITickerWebSocketMessage,
} from '../types.js';
import {
  IKrakenCandlestick,
  IKrakenOrderBookLevel,
  IKrakenOrderBook,
  IKrakenTickerWebSocketMessageData,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Transforms raw Kraken candlesticks into a compact candlestick records object.
 * @param source
 * @returns ICompactCandlestickRecords
 */
const transformCandlesticks = (source: IKrakenCandlestick[]): ICompactCandlestickRecords => (
  source.reduce(
    (prev, current) => {
      prev.id.push(toMilliseconds(current[0]));
      prev.open.push(Number(current[1]));
      prev.high.push(Number(current[2]));
      prev.low.push(Number(current[3]));
      prev.close.push(Number(current[4]));
      return prev;
    },
    buildPristineCompactCandlestickRecords(),
  )
);

/**
 * Converts a string tuple into a numeric one.
 * @param order
 * @returns [number, number]
 */
const __transformOrder = (order: IKrakenOrderBookLevel): [number, number] => (
  [Number(order[0]), Number(order[1])]
);

/**
 * Transforms a raw Kraken Order Book into the object required by the Exchange.
 * @param source
 * @returns IOrderBook
 */
const transformOrderBook = (source: IKrakenOrderBook): IOrderBook => ({
  asks: source.asks.map(__transformOrder),
  bids: source.bids.map(__transformOrder),
  lastUpdateID: 0,
});


/**
 * Transforms the ticker message received through the WebSocket into the general message type.
 * @param symbol
 * @param ticker
 * @returns ITickerWebSocketMessage
 */
const transformTicker = (
  symbol: string,
  ticker: IKrakenTickerWebSocketMessageData,
): ITickerWebSocketMessage => ({ [symbol]: ticker.last });





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  transformCandlesticks,
  transformOrderBook,
  transformTicker,
};
