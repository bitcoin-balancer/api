import { generateUUID } from '../../shared/uuid/index.js';
import { ISplitStateID } from '../shared/types.js';
import { ICompactLiquidityState } from '../liquidity/index.js';
import { ICoinsStates, ISemiCompactCoinState } from '../coins/index.js';
import { IWindowState } from '../window/types.js';
import {
  IPriceCrashStateRecord,
  IReversalConfig,
  IReversalPoints,
  IReversalPointWeights,
  IReversalState,
} from './types.js';

/* ************************************************************************************************
 *                                        POINT CALCULATORS                                       *
 ************************************************************************************************ */



/**
 * Calculates the points for each module as well as the total.
 * @param liquidityState
 * @param coinsStates
 * @returns IReversalPoints
 */
const calculatePoints = (
  liquidityState: ICompactLiquidityState,
  coinsStates: ICoinsStates<ISemiCompactCoinState>,
  stateSplits: ISplitStateID[],
  weights: IReversalPointWeights,
): IReversalPoints => ({
  total: 0,
  liquidity: 0,
  coinsQuote: 0,
  coinsBase: 0,
});





/* ************************************************************************************************
 *                                          STATE HELPERS                                         *
 ************************************************************************************************ */

/**
 * Builds the price crash state object in pristine state.
 * @returns IPriceCrashStateRecord
 */
const buildPristinePriceCrashState = (): IPriceCrashStateRecord => ({
  id: generateUUID(),
  highest_points: 0,
  final_points: 0,
  event_time: Date.now(),
  reversal_event_time: null,
});

/**
 * Calculates the times at which the module will be stateful as well as the idle period.
 * @param currentTime
 * @param crashDuration
 * @param crashIdleDuration
 * @returns { activeUntil: number, idleUntil: number }
 */
const calculateDurations = (
  currentTime: number,
  crashDuration: number,
  crashIdleDuration: number,
): { activeUntil: number, idleUntil: number } => {
  // calculate the time at which the crash state will fade away
  const activeUntil = currentTime + ((crashDuration * 60) * 1000);

  // calculate the time at which the module will no longer be idle
  const idleUntil = activeUntil + ((crashIdleDuration * 60) * 1000);

  // finally, return the times
  return { activeUntil, idleUntil };
};

/**
 * Checks if the price has just crashed and a new state should be created.
 * @param currentTime
 * @param previousWindowState
 * @param currentWindowState
 * @param activeUntil
 * @param idleUntil
 * @returns boolean
 */
const isNewPriceCrashState = (
  currentTime: number,
  previousWindowState: IWindowState | undefined,
  currentWindowState: IWindowState,
  activeUntil: number | undefined,
  idleUntil: number | undefined,
): boolean => (
  activeUntil === undefined
  && (idleUntil === undefined || currentTime > idleUntil)
  && previousWindowState !== undefined
  && (currentWindowState.state === -2 && previousWindowState.state > -2)
);

/**
 * Checks if the price crash state has ended and should be wrapped up.
 * @param currentTime
 * @param activeUntil
 * @returns boolean
 */
const hasPriceCrashStateEnded = (currentTime: number, activeUntil: number | undefined): boolean => (
  typeof activeUntil === 'number' && currentTime > activeUntil
);

/**
 * Checks if there is an active price crash state and should be updated with the new data.
 * @param currentTime
 * @param activeUntil
 * @returns boolean
 */
const isPriceCrashStateActive = (
  currentTime: number,
  activeUntil: number | undefined,
  state: IPriceCrashStateRecord | undefined,
): boolean => (
  typeof activeUntil === 'number' && activeUntil > currentTime && state !== undefined
);

/**
 * Transforms a price crash state record into a reversal state ready to be inserted into the
 * Market State.
 * @param state
 * @returns IReversalState
 */
const toState = (state: IPriceCrashStateRecord): IReversalState => ({
  id: state.id,
  points: state.final_points,
  reversalEventTime: state.reversal_event_time,
});





/* ************************************************************************************************
 *                                         CONFIG HELPERS                                         *
 ************************************************************************************************ */

/**
 * Builds the default module's configuration object.
 * @returns IReversalConfig
 */
const buildDefaultConfig = (): IReversalConfig => ({
  crashDuration: 120,
  crashIdleDuration: 60,
  pointsRequirement: 75,
  weights: {
    liquidity: 35,
    coinsQuote: 35,
    coinsBase: 30,
  },
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // point calculators
  calculatePoints,

  // state helpers
  buildPristinePriceCrashState,
  calculateDurations,
  isNewPriceCrashState,
  hasPriceCrashStateEnded,
  isPriceCrashStateActive,
  toState,

  // config helpers
  buildDefaultConfig,
};
