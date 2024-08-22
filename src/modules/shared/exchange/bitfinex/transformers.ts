import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../candlestick/index.js';
import { IBitfinexCandlestick } from './types.js';

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





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  transformCandlesticks,
};
