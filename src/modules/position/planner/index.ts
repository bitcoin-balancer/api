/* eslint-disable no-nested-ternary */
import { adjustByPercentage } from 'bignumber-utils';
import { ISplitStates, IState } from '../../market-state/shared/types.js';
import { WindowService } from '../../market-state/window/index.js';
import { IReversalState } from '../../market-state/reversal/index.js';
import { StrategyService } from '../strategy/index.js';
import { BalanceService } from '../balance/index.js';
import { IPosition } from '../types.js';
import {
  calculateStrongWindowStateRequirement,
  calculateMissingQuoteAmount,
  buildDecreaseLevels,
} from './utils.js';
import { onInsufficientQuoteBalance, onInsufficientBaseBalance } from './notifications.js';
import { IDecreasePlan, IIncreasePlan, IPositionPlan } from './types.js';

/* ************************************************************************************************
 *                                         INCREASE PLAN                                          *
 ************************************************************************************************ */

/**
 * Calculates the plan that will be put in motion if the price decreases.
 * @param currentTime
 * @param active
 * @param price
 * @param windowState
 * @param windowSplitStates
 * @param reversalState
 * @returns IIncreasePlan
 */
const __calculateIncreasePlan = (
  currentTime: number,
  active: IPosition | undefined,
  price: number,
  windowState: IState,
  windowSplitStates: ISplitStates,
  reversalState: IReversalState | undefined,
): IIncreasePlan => {
  // auto-increase must be enabled
  if (!StrategyService.config.canIncrease) {
    return { canIncrease: false };
  }

  // init values
  const isOpen: boolean = active === undefined;
  let canIncreaseAtTime: number | null = null;
  let canIncreaseAtPrice: number | null = null;
  let canIncreaseAtPriceChange: number | null = null;

  // calculate the properties based on the active position (if any)
  if (active) {
    // the idle state must have expired
    if (active.increase_actions[active.increase_actions.length - 1].nextEventTime > currentTime) {
      canIncreaseAtTime = active.increase_actions[active.increase_actions.length - 1].nextEventTime;
    }

    // calculate the price change requirement for a decreasing strongly state to become active
    const strongWindowStateRequirement = calculateStrongWindowStateRequirement(
      -2,
      windowState,
      windowSplitStates,
      WindowService.config.strongRequirement,
    );

    // calculate the price change requirement based on the strategy and the current gain%
    // if the increaseGainRequirement it means the position's gain is irrelevant and should
    // increase the position on every reversal event
    if (StrategyService.config.increaseGainRequirement === 0) {
      canIncreaseAtPriceChange = reversalState === undefined ? strongWindowStateRequirement : null;
    } else if (active.gain > StrategyService.config.increaseGainRequirement) {
      // calculate the difference between the gain requirement and the current gain
      const gainDiff = StrategyService.config.increaseGainRequirement - active.gain;

      // if there is an active reversal state, the price requirement has been met
      canIncreaseAtPriceChange = (
        typeof strongWindowStateRequirement === 'number'
        && strongWindowStateRequirement < gainDiff
          ? reversalState === undefined ? strongWindowStateRequirement : null
          : gainDiff
      );
    }

    // calculate the target price unless the position can be increased right away
    if (canIncreaseAtPriceChange) {
      canIncreaseAtPrice = adjustByPercentage(price, canIncreaseAtPriceChange);
    }
  } else if (reversalState === undefined) {
    // calculate the price change requirement for a strong decreasing state to become active
    canIncreaseAtPriceChange = calculateStrongWindowStateRequirement(
      -2,
      windowState,
      windowSplitStates,
      WindowService.config.strongRequirement,
    );
    if (canIncreaseAtPriceChange) {
      canIncreaseAtPrice = adjustByPercentage(price, canIncreaseAtPriceChange);
    }
  }

  // calculate the missing quote amount (if any)
  const missingQuoteAmount = calculateMissingQuoteAmount(
    StrategyService.config.increaseAmountQuote,
    BalanceService.balances,
  );
  if (missingQuoteAmount > 0) {
    onInsufficientQuoteBalance.broadcast([missingQuoteAmount, isOpen]);
  }

  // finally, return the plan
  return {
    canIncrease: true,
    isOpen,
    canIncreaseAtTime,
    canIncreaseAtPrice,
    canIncreaseAtPriceChange,
    increaseAmountQuote: StrategyService.config.increaseAmountQuote,
    missingQuoteAmount,
  };
};





/* ************************************************************************************************
 *                                         DECREASE PLAN                                          *
 ************************************************************************************************ */

/**
 * Calculates the plan that will be put in motion if the price increases.
 * @param currentTime
 * @param active
 * @param price
 * @param windowState
 * @param windowSplitStates
 * @param minOrderSize
 * @returns IDecreasePlan | undefined
 */
const __calculateDecreasePlan = (
  currentTime: number,
  active: IPosition | undefined,
  price: number,
  windowState: IState,
  windowSplitStates: ISplitStates,
  minOrderSize: number,
): IDecreasePlan | undefined => {
  // there must be an active position
  if (!active) {
    return undefined;
  }

  // auto-decrease must be enabled
  if (!StrategyService.config.canDecrease) {
    return { canDecrease: false };
  }

  // init values
  let canDecreaseAtTime: number | null = null;
  let canDecreaseAtPrice: number | null = null;
  let canDecreaseAtPriceChange: number | null = null;
  const decreaseLevels = buildDecreaseLevels(currentTime, active);

  // calculate the price change requirement for an increasing strongly state to become active
  const strongWindowStateRequirement = calculateStrongWindowStateRequirement(
    2,
    windowState,
    windowSplitStates,
    WindowService.config.strongRequirement,
  );

  // calculate the active decrease level (if any)
  const lvl = StrategyService.getActiveDecreaseLevel(active.gain);

  // proceed based on the state of the profitability
  if (typeof lvl === 'number') {

  } else {

  }

  // calculate the missing base amount (if any)
  const missingBaseAmount = 0;
  if (missingBaseAmount > 0) {
    onInsufficientBaseBalance.broadcast([missingBaseAmount]);
  }

  // finally, return the plan
  return {
    canDecrease: true,
    canDecreaseAtTime,
    canDecreaseAtPrice,
    canDecreaseAtPriceChange,
    missingBaseAmount,
    decreaseLevels,
  };
};





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Calculates the increase and decrease plans based on the state of the market.
 * @param currentTime
 * @param active
 * @param price
 * @param windowState
 * @param windowSplitStates
 * @param reversalState
 * @param minOrderSize
 * @returns IPositionPlan
 */
const calculatePlan = (
  currentTime: number,
  active: IPosition | undefined,
  price: number,
  windowState: IState,
  windowSplitStates: ISplitStates,
  reversalState: IReversalState | undefined,
  minOrderSize: number,
): IPositionPlan => ({
  increase: __calculateIncreasePlan(
    currentTime,
    active,
    price,
    windowState,
    windowSplitStates,
    reversalState,
  ),
  decrease: __calculateDecreasePlan(
    currentTime,
    active,
    price,
    windowState,
    windowSplitStates,
    minOrderSize,
  ),
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  calculatePlan,
};
