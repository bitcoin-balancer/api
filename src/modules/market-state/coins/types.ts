import { ISplitStateItem, ISplitStates, IState } from '../shared/types.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Coins Service
 * Object in charge of keeping Balancer in sync with the state of the top coins.
 */
type ICoinsService = {
  // properties
  config: ICoinsConfig;

  // state calculator
  getPristineState: () => ICoinsStates;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // configuration
  updateConfiguration: (newConfig: ICoinsConfig) => Promise<void>;
};





/* ************************************************************************************************
 *                                             STATE                                              *
 ************************************************************************************************ */

/**
 * Coin State
 * The object containing the state and its payload for an individual coin.
 */
type ICoinState = {
  // the state mean of the window
  state: IState;

  // the state result for each split
  splitStates: ISplitStates;

  // the price items that comprise the window
  window: ISplitStateItem[];
};

/**
 * Semi Compact Coin State
 * The object containing a compact variant of the ICoinState.
 */
type ISemiCompactCoinState = {
  state: IState;
  splitStates: ISplitStates;
};

/**
 * Compact Coin State
 * The object containing a very compact variant of the ICoinState.
 */
type ICompactCoinState = {
  state: IState;
};

/**
 * Coins State
 * The object containing the compact state for all the coins. Keep in mind this object a single
 * quote asset. One is needed for the quote asset (e.g. BTCUSDT) and one for the
 * base asset (e.g. ETHBTC).
 */
type ICoinsState = {
  // the state mean of the coins
  state: IState;

  // the compact state for each of the coins
  statesBySymbol: { [symbol:string]: ICompactCoinState };
};

/**
 * Coins States
 * The object containing the compact states for each of the assets (quote and base).
 */
type ICoinsStates = {
  // *USD*
  quote: ICoinsState;

  // BTC
  base: ICoinsState;
};





/* ************************************************************************************************
 *                                         CONFIGURATION                                          *
 ************************************************************************************************ */

/**
 * Coins Configuration
 * The object containing the configuration that will be used to build and calculate the state of the
 * top coins.
 */
type ICoinsConfig = {
  // the number of price items that comprise the window
  size: number;

  // the duration in seconds of a price item
  interval: number;

  // the % change required for the window splits to be stateful (1 | -1)
  requirement: number;

  // the % change required for the window splits to have a strong state (2 | -2)
  strongRequirement: number;

  // the maximum number of symbols that will be selected from the whitelist
  limit: number;

  // the list of symbols that can be selected
  whitelistedSymbols: string[];
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  ICoinsService,

  // state
  ICoinState,
  ISemiCompactCoinState,
  ICompactCoinState,
  ICoinsState,
  ICoinsStates,

  // configuration
  ICoinsConfig,
};
