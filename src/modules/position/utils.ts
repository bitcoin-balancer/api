import { IMarketState } from '../market-state/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Checks if a reversal event has just been issued in the current market state.
 * @param lastReversal
 * @param state
 * @returns boolean
 */
const newReversalEventIssued = (lastReversal: number, state: IMarketState): boolean => (
  state.reversalState !== undefined
  && typeof state.reversalState.reversalEventTime === 'number'
  && state.reversalState.reversalEventTime > lastReversal
);




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  newReversalEventIssued,
};
