import {
  ICandlestickIntervalID,
  IEventName,
  ICompactCandlestickRecords,
  IEventHistory,
  ICombinedCompactCandlestickRecords,
} from './types.js';

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

/**
 * Builds the combined compact candlestick records object in pristine state.
 * @returns ICompactCandlestickRecords
 */
const buildPristineCombinedCompactCandlestickRecords = (): ICombinedCompactCandlestickRecords => ({
  id: [],
  open: [],
  high: [],
  low: [],
  close: [],
});

/**
 * Builds the event history object in pristine state.
 * @param id
 * @param event
 * @param interval
 * @returns IEventHistory
 */
const buildPristineEventHistory = (
  id: string,
  event: IEventName,
  interval: ICandlestickIntervalID,
): IEventHistory => ({
  id,
  event,
  interval,
  records: buildPristineCombinedCompactCandlestickRecords(),
  event_time: Date.now(),
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildPristineCompactCandlestickRecords,
  buildPristineEventHistory,
};
