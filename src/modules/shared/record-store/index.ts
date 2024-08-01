import { IRecordStoreFactory, IStoreID } from './types.js';

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
) => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the store's identifier
  const __id: IStoreID = storeID;

  // the store's current value
  let __value: T;





  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */

  const someAction = () => {
    // ...
  };




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
    someAction,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // factory
  recordStoreServiceFactory,
};
