

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Increase Plan
 * ..
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
    /* targetPrice: number;
    targetPercentageChange: number;
    targetReversalEventPoints: number;
    targetTime: number; */
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
