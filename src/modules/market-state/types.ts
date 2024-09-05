import { Subscription } from 'rxjs';
import { IWindowState } from './window/index.js';
import { ICompactLiquidityState } from './liquidity/index.js';
import { ICoinsStates, ICompactCoinState } from './coins/index.js';
import { IReversalState } from './reversal/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Market State Service
 * Object in charge of brokering the state calculation across all the modules.
 */
type IMarketStateService = {
  // properties
  // ...

  // stream
  subscribe: (callback: (value: IMarketState) => any) => Subscription;

  // initializer
  teardown: () => Promise<void>;
  initialize: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Market State
 * The object containing the up-to-date state for all Market State's submodules.
 */
type IMarketState = {
  // the state of the window module
  windowState: IWindowState;

  // the state of the liquidity module
  liquidityState: ICompactLiquidityState;

  // the state of the coins module
  coinsStates: ICoinsStates<ICompactCoinState>;

  // the state of the reversal module
  reversalState: IReversalState | undefined;
};




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IMarketStateService,

  // types
  IMarketState,
};
