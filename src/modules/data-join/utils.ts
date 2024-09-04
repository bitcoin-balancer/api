import { ICompactCandlestickRecords } from '../candlestick/types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Creates a new compact candlesticks object that only contain the last 2 elements of the list.
 * @param window
 * @returns ICompactCandlestickRecords
 */
const sliceWindow = (window: ICompactCandlestickRecords): ICompactCandlestickRecords => ({
  id: [window.id[window.id.length - 2], window.id[window.id.length - 1]],
  open: [window.open[window.id.length - 2], window.open[window.id.length - 1]],
  high: [window.high[window.id.length - 2], window.high[window.id.length - 1]],
  low: [window.low[window.id.length - 2], window.low[window.id.length - 1]],
  close: [window.close[window.id.length - 2], window.close[window.id.length - 1]],
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  sliceWindow,
};
