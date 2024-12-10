import { IBalances } from '../../shared/exchange/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Balance Service
 * Object in charge of retrieving and syncing the account's balances for both, the base and quote
 * assets.
 */
type IBalanceService = {
  // properties
  balances: IBalances;

  // retrievers
  getBalances: () => Promise<IBalances>;

  // initializer
  initialize: () => Promise<void>;
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
  IBalanceService,

  // types
};
