

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Strategy Service
 * Object in charge of managing the configuration that will be used to manage positions.
 */
type IStrategyService = {
  // properties
  config: IStrategy;

  // calculators
  getActiveDecreaseLevel: (gain: number) => IDecreaseLevelID | undefined;
  calculateMinPositionAmountQuote: (minPositionAmountPercentage: number) => number;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;

  // configuration
  updateConfiguration: (newConfig: IStrategy) => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Increase Idle Mode
 * The mode that will be used to calculate when a position can be increased again.
 * - incremental: the increaseIdleDuration value is multiplied by the number of increases
 * - fixed: the increaseIdleDuration value is used as is, regardless of the number of increases
 */
type IIncreaseIdleMode = 'incremental' | 'fixed';

/**
 * Decrease Level ID
 * The unique identifier for a level. Used to access any level from the tuple.
 */
type IDecreaseLevelID = 0 | 1 | 2 | 3 | 4;

/**
 * Decrease Level
 * The object containing the configuration that will be used by the PositionService when the
 * position is profitable and needs to be decreased.
 */
type IDecreaseLevel = {
  // the position must be at a gain of at least gainRequirement% for the level to be active
  gainRequirement: number;

  // the percentage of the position size that will be decreased
  percentage: number;

  // the number of minutes in which the interval will continue to decrease the position (as long as
  // the conditions are met)
  frequency: number;
};

/**
 * Decrease Levels
 * The tuple that contains all the details for each level.
 */
type IDecreaseLevels = [
  IDecreaseLevel,
  IDecreaseLevel,
  IDecreaseLevel,
  IDecreaseLevel,
  IDecreaseLevel,
];

/**
 * Strategy
 * The configuration that will determine how positions will be increased and decreased.
 */
type IStrategy = {
  // if enabled, Balancer will automatically open/increase positions when conditions apply
  canIncrease: boolean;

  // if enabled, Balancer will automatically decrease positions when conditions apply
  canDecrease: boolean;

  // the amount of quote asset (USDT) that will be used to open/increase positions
  increaseAmountQuote: number;

  // the position must be at a loss of at least increaseGainRequirement% to be able to increase
  increaseGainRequirement: number;

  // the number of hours Balancer will wait before being able to increase the position again
  increaseIdleDuration: number;

  // the mode that will be used to calculate when a position can be increased again
  increaseIdleMode: IIncreaseIdleMode;

  // the tuple containing the decrease levels that will be activated based on the position's gain%
  decreaseLevels: IDecreaseLevels;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IStrategyService,

  // types
  IDecreaseLevelID,
  IDecreaseLevel,
  IDecreaseLevels,
  IStrategy,
};
