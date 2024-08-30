import { toMilliseconds } from '../../utils/index.js';
import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../candlestick/index.js';
import { ITickerWebSocketMessage } from '../types.js';
import { IKrakenCandlestick, IKrakenTickerWebSocketMessageData } from './types.js';

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
  transformTicker,
};
