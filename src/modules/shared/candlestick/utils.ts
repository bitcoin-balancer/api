import { ICompactCandlestickRecords } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds the compact candlestick records object in pristine state.
 * @returns ICompactCandlestickRecords
 */
const buildPristineCompactCandlestickRecords = (): ICompactCandlestickRecords => ({
  id: [],
  open: [],
  high: [],
  low: [],
  close: [],
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildPristineCompactCandlestickRecords,
};
