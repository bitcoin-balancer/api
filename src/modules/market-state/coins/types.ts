

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Coins Service
 * Object in charge of keeping Balancer in sync with the state of the top coins.
 */
type ICoinsService = {
  // properties
  // ...


  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};




/* ************************************************************************************************
 *                                         CONFIGURATION                                          *
 ************************************************************************************************ */





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  ICoinsService,

  // configuration
  // ...
};
