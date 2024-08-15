import { ICompactCandlestickRecords } from '../../candlestick/index.js';
import { IBinanceCandlestick } from './types.js';

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
    <ICompactCandlestickRecords>{
      id: [],
      open: [],
      high: [],
      low: [],
      close: [],
    },
  )
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  transformCandlesticks,
};
