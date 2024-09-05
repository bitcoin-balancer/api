import { generateUUID } from '../../shared/uuid/index.js';
import { IPriceCrashStateRecord, IReversalConfig, IReversalState } from './types.js';

/* ************************************************************************************************
 *                                        POINT CALCULATORS                                       *
 ************************************************************************************************ */

// ...



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


  // state helpers
  buildPristinePriceCrashState,
  toState,

  // config helpers
  buildDefaultConfig,
};
