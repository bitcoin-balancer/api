import { buildPristineEventHistory, isActive } from './utils.js';
import {
  createEventHistory,
  getEventHistoryRecord,
  updateRecords,
} from './model.js';
import {
  IEventHistory,
  ICandlestickIntervalID,
  IEventName,
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
   * Invoked whenever the latest candlestick is no longer active or if the candlesticks have not yet
   * been initialized
   * @param currentTime
   * @param data
   */
  const __onNewCandlestick = (currentTime: number, data: number[]): void => {
    __hist.records.id.push(currentTime);
    __hist.records.open.push(data);
    __hist.records.high.push(data);
    __hist.records.low.push(data);
    __hist.records.close.push(data);
  };

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
      // init the current index
      const idx = __hist.records.id.length - 1;

      // if the candlestick is active, update it. Otherwise, init the new one
      if (isActive(__hist.records.id[idx], __hist.interval, currentTime)) {
        const high: number[] = [];
        const low: number[] = [];
        const close: number[] = [];
        data.forEach((item, i) => {
          // update the high
          high.push(
            item > __hist.records.high[idx][i]
              ? item
              : __hist.records.high[idx][i],
          );

          // update the low
          low.push(
            __hist.records.low[idx][i] = item < __hist.records.low[idx][i]
              ? item
              : __hist.records.low[idx][i],
          );

          // update the close
          close.push(item);
        });
        __hist.records.high[idx] = high;
        __hist.records.low[idx] = low;
        __hist.records.close[idx] = close;
      } else {
        __onNewCandlestick(currentTime, data);
      }
    } else {
      __onNewCandlestick(currentTime, data);
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
  eventHistoryFactory,
};
