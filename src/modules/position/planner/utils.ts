import { sortRecords } from 'web-utils-kit';
import { getBigNumber, processValue } from 'bignumber-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { ISplitStateResult, ISplitStates, IState } from '../../market-state/shared/types.js';
import { IBalances } from '../../shared/exchange/index.js';
import { IPositionAction, IPosition } from '../index.js';
import { IDecreaseLevels, ITargetState } from './types.js';

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

/**
 * Transforms a split states object into an array that contains the results, sorted based on the
 * targetState.
 * @param targetState
 * @param splitStates
 * @returns ISplitStateResult[]
 */
const __sortSplitStates = (
  targetState: ITargetState,
  splitStates: ISplitStates,
): ISplitStateResult[] => (
  Object.values(splitStates).sort(sortRecords('change', targetState === 2 ? 'asc' : 'desc'))
);

/**
 * Calculates the percentage difference between the strong requirement and the second to last split
 * percentage change.
 * @param targetState
 * @param splitChange
 * @param windowStrongRequirement
 * @returns number
 */
const __calculateDifferenceBetweenRequirementAndSplitChange = (
  targetState: ITargetState,
  splitChange: number,
  windowStrongRequirement: number,
): number => (
  targetState === 2
    ? processValue(windowStrongRequirement - splitChange)
    : -(processValue(splitChange - (-windowStrongRequirement)))
);

/**
 * Based on the list of decrease actions that have been executed, it checks if a level is currently
 * idling. If so, it returns the timestamp at which the idling state fades away. Otherwise, it
 * returns null.
 * @param currentTime
 * @param decreaseActions
 * @returns number | null
 */
const getDecreaseLevelIdleUntil = (
  currentTime: number,
  decreaseActions: IPositionAction[],
): number | null => {
  if (!decreaseActions.length) {
    return null;
  }
  return currentTime > decreaseActions[decreaseActions.length - 1].nextEventTime
    ? null
    : decreaseActions[decreaseActions.length - 1].nextEventTime;
};





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Calculates the percentage the current price has to change (increase or decrease) in order for
 * a strong window state to be activated.
 * @param targetState
 * @param windowState
 * @param windowSplitStates
 * @param windowStrongRequirement
 * @returns number
 */
const calculateStrongWindowStateRequirement = (
  targetState: 2 | -2,
  windowState: IState,
  windowSplitStates: ISplitStates,
  windowStrongRequirement: number,
): number | null => {
  // check if the target and the window state match
  if (targetState === windowState) {
    return null;
  }

  // sort the split state results based on the target state. If targeting an increase in price (2),
  // the splits will be sorted ascendingly (smallest first). On the other hand, they will be sorted
  // descendingly (largest first)
  const states = __sortSplitStates(targetState, windowSplitStates);

  // calculate the percentage difference between the second to last split state change and the
  // percentage requirement for the window to have a strong state
  return __calculateDifferenceBetweenRequirementAndSplitChange(
    targetState,
    states[1].change,
    windowStrongRequirement,
  );
};

/**
 * Calculates the amount of quote asset needed in order to be able to open/increase a position. If
 * there is sufficient balance, it returns null.
 * @param increaseAmountQuote
 * @param balances
 * @returns number
 */
const calculateMissingQuoteAmount = (
  increaseAmountQuote: number,
  balances: IBalances,
): number => {
  const quoteBalance = balances[ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset] as number;
  if (increaseAmountQuote > quoteBalance) {
    return processValue(getBigNumber(increaseAmountQuote).minus(quoteBalance));
  }
  return 0;
};

/**
 * Builds the decrease levels based on the current time and the decrease actions that have taken
 * place.
 * @param currentTime
 * @param position
 * @returns IDecreaseLevels
 */
const buildDecreaseLevels = (currentTime: number, position: IPosition): IDecreaseLevels => (
  position.decrease_price_levels.map((price, idx) => ({
    price,
    idleUntil: getDecreaseLevelIdleUntil(currentTime, position.decrease_actions[idx]),
  })) as IDecreaseLevels
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  calculateStrongWindowStateRequirement,
  calculateMissingQuoteAmount,
  buildDecreaseLevels,
};
