

/* ************************************************************************************************
 *                                            FACTORY                                             *
 ************************************************************************************************ */

/**
 * Record Store Factory
 * Function in charge of generating object that store records persistently.
 */
type IRecordStoreFactory = <T>(
  storeID: IStoreID,
  defaultValue: T,
) => Promise<{
  // properties
  id: IStoreID;
  value: T;

  // actions
  // ...
}>;





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Store ID
 * Every store has a unique identifier that is use to differentiate them in the db.
 */
type IStoreID = 'AUTOMATED_TESTS_01' | 'AUTOMATED_TESTS_02';





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // factory
  IRecordStoreFactory,

  // types
  IStoreID,
};
