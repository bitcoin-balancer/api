import { IRecord } from '../../types.js';
import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../candlestick/index.js';
import { ITickerWebSocketMessage } from '../types.js';
import { IBinanceCandlestick, IBinanceTickerWebSocketMessage } from './types.js';

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
};
