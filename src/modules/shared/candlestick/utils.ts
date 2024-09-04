import {
  ICandlestickIntervalID,
  IEventName,
  ICompactCandlestickRecords,
  IEventHistoryRecord,
} from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the number of milliseconds contained by each interval
const __INTERVAL_VALUES: Record<ICandlestickIntervalID, number> = {
  '1m': (1 * 60) * 1000,
  '3m': (3 * 60) * 1000,
  '5m': (5 * 60) * 1000,
  '15m': (15 * 60) * 1000,
  '30m': (30 * 60) * 1000,
  '1h': (1 * (60 * 60)) * 1000,
  '2h': (2 * (60 * 60)) * 1000,
  '4h': (4 * (60 * 60)) * 1000,
  '6h': (6 * (60 * 60)) * 1000,
  '8h': (8 * (60 * 60)) * 1000,
  '12h': (12 * (60 * 60)) * 1000,
  '1d': (24 * (60 * 60)) * 1000,
};





/* ************************************************************************************************
 *                                         BUILD HELPERS                                          *
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
 * Builds the event history object in pristine state.
 * @param id
 * @param event
 * @param interval
 * @returns IEventHistoryRecord
 */
const buildPristineEventHistory = (
  id: string,
  event: IEventName,
  interval: ICandlestickIntervalID,
): IEventHistoryRecord => ({
  id,
  event,
  interval,
  records: {
    id: [],
    open: [],
    high: [],
    low: [],
    close: [],
  },
  event_time: Date.now(),
});





/* ************************************************************************************************
 *                                      CANDLESTICK HELPERS                                       *
 ************************************************************************************************ */

/**
 * Returns true if the current candlestick is still active.
 * @param open
 * @param interval
 * @param current
 * @returns boolean
 */
const isActive = (open: number, interval: ICandlestickIntervalID, current: number): boolean => (
  (open + __INTERVAL_VALUES[interval]) >= current
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // build helpers
  buildPristineCompactCandlestickRecords,
  buildPristineEventHistory,

  // candlestick helpers
  isActive,
};
