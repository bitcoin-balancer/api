import ms from 'ms';
import { addMilliseconds } from 'date-fns';
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
  '1m': ms('1 minutes'),
  '3m': ms('3 minutes'),
  '5m': ms('5 minutes'),
  '15m': ms('15 minutes'),
  '30m': ms('30 minutes'),
  '1h': ms('1 hours'),
  '2h': ms('2 hours'),
  '4h': ms('4 hours'),
  '6h': ms('6 hours'),
  '8h': ms('8 hours'),
  '12h': ms('12 hours'),
  '1d': ms('1 days'),
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
  addMilliseconds(open, __INTERVAL_VALUES[interval]).getTime() >= current
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
