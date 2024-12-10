

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Increase Plan
 * The plan to increase the position when the price drops significantly and a reversal event
 * is issued.
 */
type IIncreasePlan = {
  canIncrease: boolean;
} & (
  | {
    canIncrease: false;
  }
  | {
    // StrategyService.config.canIncrease
    canIncrease: true;

    // true if the plan is for opening a position instead of increasing an existing one
    isOpen: boolean;

    // the timestamp at which the position can be increased (null if it can be increased right away)
    canIncreaseAtTime: number | null;

    // the price at which the position can be increased
    canIncreaseAtPrice: number;

    // the price percentage change at which the position can be increased (null if the current price
    // is lower than the canIncreaseAtPrice)
    canIncreaseAtPriceChange: number | null;

    // the amount of quote asset that will be used to increase the position
    increaseAmountQuote: number;

    // the amount of quote asset that is missing from the balance (null if there is enough balance)
    missingQuoteAmount: number | null;
  }
);

/**
 * Decrease Plan
 * ..
 */
type IDecreasePlan = {
  canDecrease: boolean;
} & (
  | {
    canDecrease: false;
  }
  | {
    // StrategyService.config.canDecrease
    canDecrease: true;

  }
);

/**
 * Position Plan
 * The object which describes how Balancer will react based on the state of the market and the
 * strategy.
 */
type IPositionPlan = {
  increase: IIncreasePlan;
  decrease?: IDecreasePlan;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  IIncreasePlan,
  IDecreasePlan,
  IPositionPlan,
};
