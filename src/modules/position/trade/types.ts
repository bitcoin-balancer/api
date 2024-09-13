import { ITrade } from '../../shared/exchange/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Trade Service
 * Object in charge of retrieving and storing the account trades triggered by positions.
 */
type ITradeService = {
  // properties
  // ...

  // retrievers


  // initializer
  initialize: (positionOpenTime: number | undefined) => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

// ...



/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  ITradeService,

  // types
};
