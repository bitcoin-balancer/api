import { encodeError } from 'error-message-utils';
import { uuidValid } from '../shared/validations/index.js';
import { buildPristineCompactCandlestickRecords } from './utils.js';
import { getEventHistoryRecord } from './model.js';
import { eventHistoryFactory } from './event-history.js';
import {
  ICandlestickService,
  ICandlestickRecord,
  ICompactCandlestickRecords,
  IEventHistoryRecord,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Candlestick Service Factory
 * Generates the object in charge of managing candlesticks in general as well as events' histories.
 * @returns ICandlestickService
 */
const candlestickServiceFactory = (): ICandlestickService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // ...





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves the history for an event based on its ID.
   * @param id
   * @returns Promise<IEventHistoryRecord>
   * @throws
   * - 11000: if the id has an invalid format
   * - 11001: if the record was not found in the database
   */
  const getEventHistory = async (id: string): Promise<IEventHistoryRecord> => {
    if (!uuidValid(id)) {
      throw new Error(encodeError(`The event history ID '${id}' is invalid.`, 11000));
    }
    const record = await getEventHistoryRecord(id);
    if (!record) {
      throw new Error(encodeError(`The event history ID '${id}' was not found in the database.`, 11001));
    }
    return record;
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // retrievers
    getEventHistory,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const CandlestickService = candlestickServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  CandlestickService,

  // factory
  eventHistoryFactory,

  // utilities
  buildPristineCompactCandlestickRecords,

  // types
  type ICandlestickRecord,
  type ICompactCandlestickRecords,
  type IEventHistoryRecord,
};
