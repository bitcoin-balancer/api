import { calculateMean, calculatePercentageChange } from 'bignumber-utils';
import {
  IState,
  IStateResult,
  ISplitStateItem,
  ISplitStateResult,
  ISplitStateID,
  ISplitStates,
} from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the list of split identifiers
const __SPLITS: ISplitStateID[] = ['s100', 's75', 's50', 's25', 's15', 's10', 's5', 's2'];

// the actual values used to generate the splits
const __SPLIT_VALUES: { [key in ISplitStateID]: number } = {
  s100: 1,
  s75: 0.75,
  s50: 0.5,
  s25: 0.25,
  s15: 0.15,
  s10: 0.1,
  s5: 0.05,
  s2: 0.02,
};

/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

/**
 * Applies a split by ID to a series.
 * @param series
 * @param splitID
 * @returns number[] | ISplitStateItem[]
 */
const __applySplit = (
  series: number[] | ISplitStateItem[],
  splitID: ISplitStateID,
): number[] | ISplitStateItem[] =>
  series.slice(series.length - Math.ceil(series.length * __SPLIT_VALUES[splitID]));

/**
 * Extracts the first and last values from a series of numbers or split state items.
 * @param series
 * @returns { first: number, last: number }
 */
const __extractFirstAndLastValues = (
  series: number[] | ISplitStateItem[],
): { first: number; last: number } => {
  const first = series[0];
  const last = series.at(-1)!;
  return {
    first: typeof first === 'number' ? first : first.y,
    last: typeof last === 'number' ? last : last.y,
  };
};

/**
 * Calculates the state based on the percentage change experienced in the window.
 * @param change
 * @param requirement
 * @param strongRequirement
 * @returns IState
 */
const __calculateStateByPercentageChange = (
  change: number,
  requirement: number,
  strongRequirement: number,
): IState => {
  if (change >= strongRequirement) {
    return 2;
  }
  if (change >= requirement) {
    return 1;
  }
  if (change <= -strongRequirement) {
    return -2;
  }
  if (change <= -requirement) {
    return -1;
  }
  return 0;
};

/* ************************************************************************************************
 *                                        STATE CALCULATORS                                       *
 ************************************************************************************************ */

/**
 * Calculates the state for a split based on the percentage change experienced and the requirements.
 * @param series
 * @param requirement
 * @param strongRequirement
 * @returns ISplitStateResult
 */
const calculateSplitState = (
  series: number[] | ISplitStateItem[],
  requirement: number,
  strongRequirement: number,
): ISplitStateResult => {
  // extract the initial and final values
  const { first, last } = __extractFirstAndLastValues(series);

  // calculate the percentage change experienced in the window
  const change = calculatePercentageChange(first, last);

  // finally, return the result
  return {
    state: __calculateStateByPercentageChange(change, requirement, strongRequirement),
    change,
  };
};

/**
 * Calculates the mean for a list of states.
 * @param states
 * @returns IState
 */
const calculateStateMean = (states: IState[]): IState => {
  const mean = calculateMean(states);
  if (mean >= 1.5) {
    return 2;
  }
  if (mean >= 0.75) {
    return 1;
  }
  if (mean <= -1.5) {
    return -2;
  }
  if (mean <= -0.75) {
    return -1;
  }
  return 0;
};

/**
 * Calculates the state mean and the state for all the splits for a series.
 * @param series
 * @param requirement
 * @param strongRequirement
 * @returns IStateResult
 */
const calculateStateForSeries = (
  series: number[] | ISplitStateItem[],
  requirement: number,
  strongRequirement: number,
): IStateResult => {
  // calculate the state for each split
  const states: ISplitStates = __SPLITS.reduce(
    (prev, current) => ({
      ...prev,
      [current]: calculateSplitState(__applySplit(series, current), requirement, strongRequirement),
    }),
    <ISplitStates>{},
  );

  // finally, return the result
  return {
    mean: calculateStateMean(Object.values(states).map((splitState) => splitState.state)),
    splits: states,
  };
};

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // state calculators
  calculateSplitState,
  calculateStateMean,
  calculateStateForSeries,

  // ...
};
