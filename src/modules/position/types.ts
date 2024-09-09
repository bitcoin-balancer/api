import { IBalances } from '../shared/exchange/index.js';

/* ************************************************************************************************
 *                                           SERVICES                                             *
 ************************************************************************************************ */

/**
 * Position Service
 * Object in charge of opening, increasing and decreasing positions.
 */
type IPositionService = {
  // properties
  // ...

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};

/**
 * Balance Service
 * Object in charge of retrieving and syncing the account's balances for both, the base and quote
 * assets.
 */
type IBalanceService = {
  // properties
  // ...

  // retrievers
  getBalances: (forceRefetch?: boolean) => Promise<IBalances>;

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
  // services
  IPositionService,
  IBalanceService,

  // types
};
