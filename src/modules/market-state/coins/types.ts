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

  // retrievers
  getStateForSymbol: (asset: ICoinStateAsset, symbol: string) => ICoinState;
  getSemiCompactStateForAsset: (asset: ICoinStateAsset) => ICoinsState<ISemiCompactCoinState>;

  // state calculator
  calculateState: () => ICoinsStatesCalculationPayload;
  getPristineState: () => ICoinsStates<ICompactCoinState>;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
  teardownAndInitializeModule: () => Promise<void>

  // configuration
  updateConfiguration: (newConfig: ICoinsConfig) => Promise<void>;
};





/* ************************************************************************************************
 *                                             STATE                                              *
 ************************************************************************************************ */

/**
 * Coin State Asset
 * The state of a coin could be based on the quote (e.g. ETHUSDT) or the base (e.g. ETHBTC) asset.
 */
type ICoinStateAsset = 'quote' | 'base';

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
 * The object containing the state for all the coins. Keep in mind this object a single
 * quote asset. One is needed for the quote asset (e.g. BTCUSDT) and one for the
 * base asset (e.g. ETHBTC).
 */
type ICoinsState<T> = {
  // the state mean of the coins
  state: IState;

  // the state for each of the coins
  statesBySymbol: { [symbol:string]: T };
};

/**
 * Coins States
 * The object containing the state for all the coins and assets (quote and base).
 */
type ICoinsStates<T> = {
  [key in ICoinStateAsset]: ICoinsState<T>;
};

/**
 * States By Symbol
 * Utility type used to build the state calculation payload that will be passed to the market state.
 */
type IStatesBySymbol = {
  compact: { [symbol:string]: ICompactCoinState },
  semiCompact: { [symbol:string]: ISemiCompactCoinState },
};

/**
 * State Calculation Payload
 * The object containing the state in both compact variants that is returned when calculating the
 * state.
 */
type ICoinsStatesCalculationPayload = {
  compact: ICoinsStates<ICompactCoinState>;
  semiCompact: ICoinsStates<ISemiCompactCoinState>;
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
  ICoinStateAsset,
  ICoinState,
  ISemiCompactCoinState,
  ICompactCoinState,
  ICoinsState,
  ICoinsStates,
  IStatesBySymbol,
  ICoinsStatesCalculationPayload,

  // configuration
  ICoinsConfig,
};
