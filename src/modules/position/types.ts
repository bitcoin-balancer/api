

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

  // the total amount of quote asset (USDT) that has been invested into the position (increase
  // actions)
  amount_quote_in: number;

  // the total amount of quote asset (USDT) that has been claimed by decrease actions
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
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IPositionService,

  // types

  // position
  IPositionAction,
  IPosition,
};
