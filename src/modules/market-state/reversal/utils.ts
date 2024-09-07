/* eslint-disable @typescript-eslint/brace-style */
import { calculatePercentageRepresentation, processValue } from 'bignumber-utils';
import { generateUUID } from '../../shared/uuid/index.js';
import { ISplitStateID, IState } from '../shared/types.js';
import { IWindowState } from '../window/types.js';
import { ICompactLiquidityState } from '../liquidity/index.js';
import { ICoinsState, ICoinsStates, ISemiCompactCoinState } from '../coins/index.js';
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
 * Calculates the points generated by the Liquidity Module. The higher the bid dominance, the higher
 * the points.
 * @param liquidityState
 * @param weight
 * @returns number
 */
const __calculateLiquidityPoints = (
  { bidDominance }: ICompactLiquidityState,
  weight: number,
): number => {
  let score;
  if (bidDominance >= 98) { score = 1.00; }
  else if (bidDominance >= 96) { score = 0.99; }
  else if (bidDominance >= 94) { score = 0.98; }
  else if (bidDominance >= 92) { score = 0.97; }
  else if (bidDominance >= 90) { score = 0.96; }
  else if (bidDominance >= 88) { score = 0.95; }
  else if (bidDominance >= 86) { score = 0.94; }
  else if (bidDominance >= 84) { score = 0.92; }
  else if (bidDominance >= 82) { score = 0.90; }
  else if (bidDominance >= 80) { score = 0.88; }
  else if (bidDominance >= 78) { score = 0.86; }
  else if (bidDominance >= 76) { score = 0.84; }
  else if (bidDominance >= 74) { score = 0.82; }
  else if (bidDominance >= 72) { score = 0.80; }
  else if (bidDominance >= 70) { score = 0.77; }
  else if (bidDominance >= 68) { score = 0.74; }
  else if (bidDominance >= 66) { score = 0.71; }
  else if (bidDominance >= 64) { score = 0.68; }
  else if (bidDominance >= 62) { score = 0.65; }
  else if (bidDominance >= 60) { score = 0.62; }
  else if (bidDominance >= 58) { score = 0.59; }
  else if (bidDominance >= 56) { score = 0.56; }
  else if (bidDominance >= 54) { score = 0.53; }
  else if (bidDominance >= 52) { score = 0.50; }
  else if (bidDominance >= 50) { score = 0.47; }
  else if (bidDominance >= 48) { score = 0.44; }
  else if (bidDominance >= 46) { score = 0.41; }
  else if (bidDominance >= 44) { score = 0.38; }
  else if (bidDominance >= 42) { score = 0.35; }
  else if (bidDominance >= 40) { score = 0.32; }
  else if (bidDominance >= 38) { score = 0.29; }
  else if (bidDominance >= 36) { score = 0.26; }
  else if (bidDominance >= 34) { score = 0.23; }
  else if (bidDominance >= 32) { score = 0.20; }
  else if (bidDominance >= 30) { score = 0.17; }
  else if (bidDominance >= 28) { score = 0.15; }
  else if (bidDominance >= 26) { score = 0.14; }
  else if (bidDominance >= 24) { score = 0.13; }
  else if (bidDominance >= 22) { score = 0.12; }
  else if (bidDominance >= 20) { score = 0.11; }
  else if (bidDominance >= 18) { score = 0.10; }
  else if (bidDominance >= 16) { score = 0.09; }
  else if (bidDominance >= 14) { score = 0.08; }
  else if (bidDominance >= 12) { score = 0.07; }
  else if (bidDominance >= 10) { score = 0.06; }
  else if (bidDominance >= 8) { score = 0.05; }
  else if (bidDominance >= 6) { score = 0.04; }
  else if (bidDominance >= 4) { score = 0.03; }
  else if (bidDominance >= 2) { score = 0.02; }
  else { score = 0.01; }
  return processValue(score * weight);
};

/**
 * Calculates the score (not points!) obtained by a single split.
 * @param splitState
 * @returns number
 */
const __calculateScoreForSplit = (splitState: IState): number => {
  switch (splitState) {
    case 2:
      return 1;
    case 1:
      return 0.75;
    case -1:
      return 0.25;
    case -2:
      return 0;
    default:
      return 0.5;
  }
};

/**
 * Calculates the total score for all symbols based on their split states.
 * @param states
 * @param stateSplits
 * @returns number
 */
const __calculateScoreForSymbols = (
  states: ISemiCompactCoinState[],
  stateSplits: ISplitStateID[],
): number => states.reduce(
  (previous, current) => (
    previous + stateSplits.reduce(
      (previousInner, currentInner) => (
        previousInner + __calculateScoreForSplit(current.splitStates[currentInner].state)
      ),
      0,
    )
  ),
  0,
);

/**
 * Calculates the state for the state of the coins (quote or base).
 * @param coinsState
 * @param stateSplits
 * @param weight
 * @returns number
 */
const __calculateCoinsPoints = (
  { statesBySymbol }: ICoinsState<ISemiCompactCoinState>,
  stateSplits: ISplitStateID[],
  weight: number,
): number => {
  // init the state for all symbols
  const states = Object.values(statesBySymbol);

  // calculate the score obtained by all the symbols
  const score: number = __calculateScoreForSymbols(states, stateSplits);

  // the highest possible score that can be obtained by all symbols combined
  const highest = states.length * stateSplits.length;

  // calculate the score received based the highest possible one
  const received = calculatePercentageRepresentation(score, highest);

  // finally, turn the score into reversal points and return it
  return processValue((received / 100) * weight);
};


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
): IReversalPoints => {
  // init values
  let total: number = 0;

  // calculate the liquidity points
  const liquidity = __calculateLiquidityPoints(liquidityState, weights.liquidity);
  total += liquidity;

  // calculate the coins quote points
  const coinsQuote = __calculateCoinsPoints(coinsStates.quote, stateSplits, weights.coinsQuote);
  total += coinsQuote;

  // calculate the coins base points
  const coinsBase = __calculateCoinsPoints(coinsStates.base, stateSplits, weights.coinsBase);
  total += coinsBase;

  // finally, return the points build
  return {
    total,
    liquidity,
    coinsQuote,
    coinsBase,
  };
};





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
  crashIdleDuration: 30,
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
