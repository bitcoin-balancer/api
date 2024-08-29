import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../candlestick/index.js';
import { ITickerWebSocketMessage } from '../types.js';
import { IBitfinexCandlestick, IBitfinexTickerWebSocketMessageData } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Transforms raw Bitfinex candlesticks into a compact candlestick records object.
 * @param source
 * @returns ICompactCandlestickRecords
 */
const transformCandlesticks = (source: IBitfinexCandlestick[]): ICompactCandlestickRecords => (
  source.reverse().reduce(
    (prev, current) => {
      prev.id.push(current[0]);
      prev.open.push(current[1]);
      prev.close.push(current[2]);
      prev.high.push(current[3]);
      prev.low.push(current[4]);
      return prev;
    },
    buildPristineCompactCandlestickRecords(),
  )
);

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
export {
  transformCandlesticks,
  transformTicker,
};
