import { IQueryResult } from '../../database/types.js';
import { readRecord, writeRecord } from './model.js';
import { IRecordStoreFactory, IStoreID, IRecordStore } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Record Store Factory
 * Generates the object in charge of persistently storing records.
 * @returns Promise<IRecordStoreService>
 */
const recordStoreServiceFactory: IRecordStoreFactory = async <T>(
  storeID: IStoreID,
  defaultValue: T,
): Promise<IRecordStore<T>> => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the store's identifier
  const __id: IStoreID = storeID;

  // the store's current value - initialize it in case it hasn't been
  let __value = <T> await readRecord(__id);
  if (__value === null) {
    await writeRecord(__id, defaultValue, true);
    __value = defaultValue;
  }





  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */

  /**
   * Updates the value of the store.
   * @param newValue
   * @returns Promise<IQueryResult>
   */
  const update = (newValue: T): Promise<IQueryResult> => writeRecord(__id, newValue);





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get id() {
      return __id;
    },
    get value() {
      return __value;
    },

    // actions
    update,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // factory
  recordStoreServiceFactory,
};
