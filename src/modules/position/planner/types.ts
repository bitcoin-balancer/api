

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Target State
 * The window state that needs that's required by the plan (increase or decrease).
 */
type ITargetState = 2 | -2;

/**
 * Increase Plan
 * The plan that will be used to open/increase a position when the price drops significantly and a
 * reversal event is issued.
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
    canIncreaseAtPrice: number | null;

    // the price percentage change at which the position can be increased (null if the current price
    // is lower than the canIncreaseAtPrice)
    canIncreaseAtPriceChange: number | null;

    // the amount of quote asset that will be used to increase the position
    increaseAmountQuote: number;

    // the amount of quote asset that is missing from the balance (null if there is enough balance)
    missingQuoteAmount: number;
  }
);

/**
 * Decrease Level
 * The object containing the properties of a decrease level which it is derived from the
 * Strategy based on the state of the position.
 */
type IDecreaseLevel = {
  // the price at which the level will become active
  price: number;

  // the timestamp (ms) at which the level can decrease the position again (null if it can decrease
  // it right away)
  idleUntil: number | null;
};
type IDecreaseLevels = [
  IDecreaseLevel,
  IDecreaseLevel,
  IDecreaseLevel,
  IDecreaseLevel,
  IDecreaseLevel,
];

/**
 * Decrease Plan
 * The plan that will be used to decrease an active position when the price is rising significantly
 * and a decrease level is hit.
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

    // the timestamp at which the position can be decreased, based on the active decrease level
    // (null if it can be decreased right away)
    canDecreaseAtTime: number | null;

    // the price at which the position can be decreased
    canDecreaseAtPrice: number | null;

    // the price percentage change at which the position can be decreased (null if the current price
    // is higher than the canDecreaseAtPrice)
    canDecreaseAtPriceChange: number | null;

    // the percentage of the position amount that will be decreased (based on the active level)
    decreasePercentage: number;

    // the amount of base asset that is missing from the balance (null if there is enough balance)
    missingBaseAmount: number;

    // the list of decrease level records
    decreaseLevels: IDecreaseLevels;
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
  ITargetState,
  IIncreasePlan,
  IDecreaseLevels,
  IDecreasePlan,
  IPositionPlan,
};
