import { ISplitStates } from '../../market-state/shared/types.js';
import { WindowService } from '../../market-state/window/index.js';
import { StrategyService } from '../strategy/index.js';
import { ICompactPosition } from '../types.js';
import { IDecreasePlan, IIncreasePlan, IPositionPlan } from './types.js';

/* ************************************************************************************************
 *                                         INCREASE PLAN                                          *
 ************************************************************************************************ */

/**
 * Calculates the plan that will be put in motion if the price decreases.
 * @param currentTime
 * @param active
 * @param price
 * @param splitStates
 * @returns IIncreasePlan
 */
const __calculateIncreasePlan = (
  currentTime: number,
  active: ICompactPosition | undefined,
  price: number,
  splitStates: ISplitStates,
): IIncreasePlan => {
  // auto-increase must be enabled
  if (!StrategyService.config.canIncrease) {
    return { canIncrease: false };
  }

  // init values
  // ...

  // ...
  if (active) {

  } else {

  }

  // finally, return the plan
  return {
    canIncrease: true,
    isOpen: active === undefined,
    // ...
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
 * @param splitStates
 * @returns IDecreasePlan | undefined
 */
const __calculateDecreasePlan = (
  currentTime: number,
  active: ICompactPosition | undefined,
  price: number,
  splitStates: ISplitStates,
): IDecreasePlan | undefined => {
  // there must be an active position
  if (!active) {
    return undefined;
  }

  // auto-decrease must be enabled
  if (!StrategyService.config.canDecrease) {
    return { canDecrease: false };
  }

  // ...


  // finally, return the plan
  return {
    canDecrease: true,
    // ...
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
 * @param splitStates
 * @returns IPositionPlan
 */
const calculatePlan = (
  currentTime: number,
  active: ICompactPosition | undefined,
  price: number,
  splitStates: ISplitStates,
): IPositionPlan => ({
  increase: __calculateIncreasePlan(currentTime, active, price, splitStates),
  decrease: __calculateDecreasePlan(currentTime, active, price, splitStates),
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  calculatePlan,
};
