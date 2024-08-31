import { IRecord } from '../../types.js';
import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../candlestick/index.js';
import { IOrderBook, IOrderBookWebSocketMessage, ITickerWebSocketMessage } from '../types.js';
import {
  IBinanceCandlestick,
  IBinanceOrderBook,
  IBinanceOrderBookWebSocketMessage,
  IBinanceTickerWebSocketMessage,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Transforms raw Binance candlesticks into a compact candlestick records object.
 * @param source
 * @returns ICompactCandlestickRecords
 */
const transformCandlesticks = (source: IBinanceCandlestick[]): ICompactCandlestickRecords => (
  source.reduce(
    (prev, current) => {
      prev.id.push(current[0]);
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
const __transformOrders = (order: [string, string]): [number, number] => (
  [Number(order[0]), Number(order[1])]
);

/**
 * Transforms a raw Binance Order Book into the object required by the Exchange.
 * @param source
 * @returns IOrderBook
 */
const transformOrderBook = (source: IBinanceOrderBook): IOrderBook => ({
  asks: source.asks.map(__transformOrders),
  bids: source.bids.map(__transformOrders),
  lastUpdateID: source.lastUpdateId,
});

/**
 * Transforms an order book update object into the websocket message required by the Exchange.
 * @param source
 * @returns IOrderBookWebSocketMessage
 */
const transformOrderBookMessage = (
  source: IBinanceOrderBookWebSocketMessage,
): IOrderBookWebSocketMessage => ({
  asks: source.a.map(__transformOrders),
  bids: source.b.map(__transformOrders),
  finalUpdateID: source.u,
});

/**
 * Transforms the ticker message received through the WebSocket into the general message type.
 * @param topPairs
 * @param tickers
 * @returns ITickerWebSocketMessage
 */
const transformTickers = (
  topPairs: IRecord<string>,
  tickers: IBinanceTickerWebSocketMessage,
): ITickerWebSocketMessage => tickers.reduce(
  (previous, current) => {
    if (topPairs[current.s]) {
      return { ...previous, [topPairs[current.s]]: Number(current.c) };
    }
    return previous;
  },
  {},
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  transformCandlesticks,
  transformTickers,
  transformOrderBook,
  transformOrderBookMessage,
};
