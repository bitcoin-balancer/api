import { IQueryResult } from '../../database/index.js';

/* ************************************************************************************************
 *                                            FACTORY                                             *
 ************************************************************************************************ */

/**
 * Record Store Factory
 * Function in charge of generating RecordStore objects.
 */
type IRecordStoreFactory = <T>(
  storeID: IStoreID,
  defaultValue: T,
) => Promise<IRecordStore<T>>;

/**
 * Record Store
 * Object in charge of storing records persistently.
 */
type IRecordStore<T> = {
  // properties
  id: IStoreID;
  value: T;

  // actions
  update: (newValue: T) => Promise<IQueryResult>;
};



/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Store ID
 * Every store has a unique identifier that is use to differentiate them in the db.
 */
type IStoreID = 'AUTOMATED_TESTS_01' | 'AUTOMATED_TESTS_02' | 'SERVER_ALARMS';





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // factory
  IRecordStoreFactory,
  IRecordStore,

  // types
  IStoreID,
};
