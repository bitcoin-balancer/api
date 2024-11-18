

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
    canIncrease: true;
    targetPrice: number;
    targetPercentageChange: number;
    targetReversalEventPoints: number;
    targetTime: number;
  }
);

/**
 * Decrease Plan
 * ..
 */
type IDecreasePlan = {

};

/**
 * Position Plan
 * The object which describes how Balancer will react based on the state of the market and the
 * strategy.
 */
type IPositionPlan = {
  increase: IIncreasePlan;
  decrease: IDecreasePlan;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  IIncreasePlan,
  IDecreasePlan,
  IPositionPlan,
};
