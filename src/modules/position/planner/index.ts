import { IDecreasePlan, IIncreasePlan, IPositionPlan } from './types.js';

/* ************************************************************************************************
 *                                         INCREASE PLAN                                          *
 ************************************************************************************************ */

const __calculateIncreasePlan = (): IIncreasePlan => ({ canIncrease: false });



/* ************************************************************************************************
 *                                         DECREASE PLAN                                          *
 ************************************************************************************************ */

const __calculateDecreasePlan = (): IDecreasePlan | undefined => undefined;



/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

const calculatePlan = (): IPositionPlan => ({
  increase: __calculateIncreasePlan(),
  decrease: __calculateDecreasePlan(),
});




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  calculatePlan,
};
