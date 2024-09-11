

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
 *                                            POSITION                                            *
 ************************************************************************************************ */

/**
 * Position Action
 * The object containing the details for a position action (increase or decrease).
 */
type IPositionAction = {
  // the identifier of the action's transaction
  txID: number;

  // the timestamp (ms) at which the increase|decrease took place
  eventTime: number;

  // the timestamp at which the position can be increased|decreased again
  nextEventTime: number;
};

/**
 * Position
 * The object containing the state of a position that may be active.
 */
type IPosition = {
  // universally unique identifier
  id: string;

  // the timestamp at which the position was opened
  open: number;

  // the timestamp at which the position was closed. If null, the position is still active
  close: number | null;

  // the weighted average price
  entry_price: number;

  // the % the price has moved in favor or against. If the position is at a loss, this value will
  // be negative
  gain: number;

  // the current amount of base asset (and its quote equivalent) allocated into the position
  // if the amount is 0, the position will be closed
  amount: number;
  amount_quote: number;

  // the amount of quote asset that has been invested into the position and claimed
  amount_quote_in: number;
  amount_quote_out: number;

  // the position's profit and loss in quote asset
  pnl: number;

  // the position's return on investment
  roi: number;

  // the prices at which the decrease levels become active
  decrease_price_levels: [number, number, number, number, number];

  // the list of increase actions
  increase_actions: IPositionAction[];

  // the list of decrease actions by level
  decrease_actions: [
    IPositionAction[],
    IPositionAction[],
    IPositionAction[],
    IPositionAction[],
    IPositionAction[],
  ];
};





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
  // minPositionSize: number;

  // the amount of quote asset (USDT) that will be used to open/increase positions
  increaseAmountQuote: number;

  // the number of hours Balancer will before before being able to increase the position again
  increaseIdleDuration: number;

  // the position must be at a loss of at least increaseLossRequirement% to be able to increase
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

  // position
  IPositionAction,
  IPosition,

  // strategy
  IDecreaseLevel,
  IStrategy,
};
