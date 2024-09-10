

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Position Service
 * Object in charge of opening, increasing and decreasing positions.
 */
type IPositionService = {
  // properties
  // ...

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

// ...





/* ************************************************************************************************
 *                                            STRATEGY                                            *
 ************************************************************************************************ */

/**
 * Decrease Level
 * The object containing the configuration that will be used by the PositionService when the
 * position is profitable and needs to be decreased.
 */
type IDecreaseLevel = {
  // the position must be at a gain of gainRequirement% for the level to be active
  gainRequirement: number;

  // the percentage of the position size that will be decreased
  size: number;

  // the number of minutes in which the interval will continue to decrease the position (as long as
  // the WindowState is strongly increasing)
  frequency: number;
};

/**
 * Strategy
 * The configuration that will determine how positions will be increased and decreased.
 */
type IStrategy = {
  // if enabled, Balancer will automatically open/increase positions when conditions apply
  canIncrease: boolean;

  // if enabled, Balancer will automatically decrease positions when conditions apply
  canDecrease: boolean;

  // if the position amount is <= minPositionSize (quote asset), it will be completely closed on the
  // next decrease action
  minPositionSize: number;

  // the amount of quote asset (USDT) that will be used to open/increase positions
  increaseSize: number;

  // the number of hours Balancer will before before being able to increase the position again
  increaseIdleDuration: number;

  // the position must be at a loss of increaseLossRequirement% to be able to increase
  increaseLossRequirement: number;

  // the tuple containing the decrease levels that will be activated based on the position's gain%
  decreaseLevels: [IDecreaseLevel, IDecreaseLevel, IDecreaseLevel, IDecreaseLevel, IDecreaseLevel];
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IPositionService,

  // types


  // strategy
  IDecreaseLevel,
  IStrategy,
};
