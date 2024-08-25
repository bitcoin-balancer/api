import { IStreamSubscription } from '../../shared/types.js';
import { ICompactCandlestickRecords } from '../../shared/candlestick/index.js';
import { ICandlestickInterval } from '../../shared/exchange/index.js';
import { ISplitStates, IState } from '../shared/types.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Window Service
 * Object in charge of keeping Balancer in sync with the market's candlesticks and calculating its
 * state.
 */
type IWindowService = {
  // properties
  config: IWindowConfig;

  // stream
  subscribe: IStreamSubscription<ICompactCandlestickRecords>;

  // state calculator
  calculateState: () => IWindowState;
  getPristineState: () => IWindowState;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // configuration
  updateConfiguration: (newConfig: IWindowConfig) => Promise<void>;
};



/* ************************************************************************************************
 *                                             STATE                                              *
 ************************************************************************************************ */

/**
 * Window State
 * The current state of the window as well as the payload.
 */
type IWindowState = {
  // the state mean of the window
  state: IState;

  // the state result for each split
  splitStates: ISplitStates;

  // the candlesticks that comprise the window
  window: ICompactCandlestickRecords; // the compact state only includes the last 2 records
};





/* ************************************************************************************************
 *                                         CONFIGURATION                                          *
 ************************************************************************************************ */

/**
 * Window Config
 * The object containing the configuration that will be used to fetch the candlesticks and calculate
 * the state.
 */
type IWindowConfig = {
  // the candlesticks will be re-fetched every refetchFrequency seconds
  refetchFrequency: number;

  // the number of candlesticks that comprise the window
  size: number;

  // the time interval that is contained by a single candlestick
  interval: ICandlestickInterval;

  // the % change required for the window splits to be stateful (1 | -1)
  requirement: number;

  // the % change required for the window splits to have a strong state (2 | -2)
  strongRequirement: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IWindowService,

  // state
  IWindowState,

  // configuration
  IWindowConfig,
};
