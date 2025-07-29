import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../candlestick/index.js';
import { IOrderBook, IOrderBookWebSocketMessage, ITickerWebSocketMessage } from '../types.js';
import {
  IBitfinexCandlestick,
  IBitfinexOrderBook,
  IBitfinexOrderBookLevel,
  IBitfinexTickerWebSocketMessageData,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Transforms raw Bitfinex candlesticks into a compact candlestick records object.
 * @param source
 * @returns ICompactCandlestickRecords
 */
const transformCandlesticks = (source: IBitfinexCandlestick[]): ICompactCandlestickRecords =>
  source.reverse().reduce((prev, current) => {
    prev.id.push(current[0]);
    prev.open.push(current[1]);
    prev.close.push(current[2]);
    prev.high.push(current[3]);
    prev.low.push(current[4]);
    return prev;
  }, buildPristineCompactCandlestickRecords());

/**
 * Transforms a raw Bitfinex Order Book into the object required by the Exchange.
 * @param source
 * @returns IOrderBook
 */
const transformOrderBook = (source: IBitfinexOrderBook): IOrderBook =>
  source.reduce(
    (previous, current) => {
      if (current[2] > 0) {
        return { ...previous, bids: [...previous.bids, [current[0], current[2]]] };
      }
      return { ...previous, asks: [...previous.asks, [current[0], -current[2]]] };
    },
    <IOrderBook>{
      asks: [],
      bids: [],
      lastUpdateID: 0, // placeholder
    },
  );

/**
 * Transforms an order book update object into the websocket message required by the Exchange.
 * @param source
 * @returns IOrderBookWebSocketMessage
 */
const transformOrderBookMessage = (source: IBitfinexOrderBookLevel): IOrderBookWebSocketMessage => {
  if (source[2] > 0) {
    return {
      asks: [],
      bids: [[source[0], source[1] === 0 ? 0 : source[2]]],
      finalUpdateID: 1, // placeholder
    };
  }
  return {
    asks: [[source[0], source[1] === 0 ? 0 : -source[2]]],
    bids: [],
    finalUpdateID: 1, // placeholder
  };
};

/**
 * Transforms the ticker message received through the WebSocket into the general message type.
 * @param symbol
 * @param ticker
 * @returns ITickerWebSocketMessage
 */
const transformTicker = (
  symbol: string,
  ticker: IBitfinexTickerWebSocketMessageData,
): ITickerWebSocketMessage => ({ [symbol]: ticker[6] });

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { transformCandlesticks, transformOrderBook, transformOrderBookMessage, transformTicker };
