import {
  buildPristineCompactCandlestickRecords,
  buildPristineEventHistory,
} from './utils.js';
import {
  createEventHistory,
  getEventHistoryRecord,
  updateRecords,
} from './model.js';
import {
  IEventHistory,
  ICandlestickIntervalID,
  IEventName,
  ICandlestickRecord,
  ICompactCandlestickRecords,
  IEventHistoryRecord,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Event History Factory
 * Generates the object in charge of creating and storing historic data in OHLC format.
 * @returns Promise<IEventHistory>
 */
const eventHistoryFactory = async (
  id: string,
  event: IEventName,
  interval: ICandlestickIntervalID,
): Promise<IEventHistory> => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the event history object. If it doesn't exist, the pristine build is generated and saved
  let __hist = await getEventHistoryRecord(id);
  if (!__hist) {
    __hist = buildPristineEventHistory(id, event, interval);
    await createEventHistory(__hist);
  }

  // the records will be updated every UPDATE_FREQUENCY seconds
  let __updateInterval: NodeJS.Timeout;
  const __UPDATE_FREQUENCY = 60;





  /* **********************************************************************************************
   *                                         DATA HANDLER                                         *
   ********************************************************************************************** */

  /**
   * Invoked whenever new data comes into existance. It will update the current candlestick and
   * check if the interval has concluded.
   * @param data
   */
  const handleNewData = (data: number[]): void => {
    // init the current time
    const currentTime = Date.now();

    // if records have already been added, proceed to update them
    if (__hist.records.id.length > 0) {

    } else {
      __hist.records.id.push(currentTime);
    }
  };





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Invoked when the event has completed. It deactivates the update interval and updates the
   * records one last time.
   */
  const complete = async (): Promise<void> => {
    clearInterval(__updateInterval);
    await updateRecords(__hist.id, __hist.records);
  };

  /**
   * Starts the interval that will update the records every __UPDATE_FREQUENCY seconds.
   */
  __updateInterval = setInterval(() => {
    updateRecords(__hist.id, __hist.records);
  }, __UPDATE_FREQUENCY * 1000);





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // event handler
    handleNewData,

    // initializer
    complete,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // factory
  eventHistoryFactory,

  // utilities
  buildPristineCompactCandlestickRecords,

  // types
  type ICandlestickRecord,
  type ICompactCandlestickRecords,
  type IEventHistoryRecord,
};
