import { IEventHistoryRecord } from '../shared/candlestick/index.js';
import { ITrade } from '../shared/exchange/index.js';
import { IManualTrade } from './trade/index.js';
import { ITransaction } from './transaction/index.js';

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

  // actions
  increasePosition: () => Promise<void>;
  decreasePosition: (percentage: number) => Promise<void>;
  archivePosition: (id: string) => Promise<void>;
  unarchivePosition: (id: string) => Promise<void>;

  // retrievers
  getActive: () => ICompactPosition | undefined;
  getPosition: (id: string) => Promise<IPosition>;
  listCompactPositions: (
    limit: number,
    startAtOpenTime: number | undefined,
  ) => Promise<ICompactPosition[]>;
  listCompactPositionsByRange: (
    startAt: number,
    endAt: number | undefined,
  ) => Promise<ICompactPosition[]>;
  getPositionHistory: (id: string) => Promise<IEventHistoryRecord>;
  listPositionTrades: (id: string) => Promise<ITrade[]>;
  listPositionTransactions: (id: string) => Promise<ITransaction[]>;

  // trade management
  createTrade: (trade: IManualTrade) => Promise<ITrade>;
  updateTrade: (id: number, trade: IManualTrade) => Promise<ITrade>;
  deleteTrade: (id: number) => Promise<void>;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Decrease Price Levels
 * Each level has its own price that is calculated based on its gainRequirement%.
 */
type IDecreasePriceLevels = [number, number, number, number, number];

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
 * Decrease Actions
 * The tuple containing all of the decrease actions by level.
 */
type IDecreaseActions = [
  IPositionAction[],
  IPositionAction[],
  IPositionAction[],
  IPositionAction[],
  IPositionAction[],
];

/**
 * Market State Dependant Props
 * The properties that should be recalculated every time the market state changes.
 */
type IMarketStateDependantProps = {
  gain: number,
  amount_quote: number,
  pnl: number,
  roi: number,
};

/**
 * Trades Analysis
 * The key values extracted from the list of position trades, used to manage active positions.
 */
type ITradesAnalysis = {
  open: number;
  close: number | null;
  entry_price: number;
  amount: number;
  amount_quote: number;
  amount_quote_in: number;
  amount_quote_out: number;
  pnl: number;
  roi: number;
  decrease_price_levels: IDecreasePriceLevels;
};





/* ************************************************************************************************
 *                                            POSITION                                            *
 ************************************************************************************************ */

/**
 * Position
 * The object containing the state of a position that may be active.
 */
type IPosition = {
  // the universally unique identifier
  id: string;

  // the timestamp at which the position was opened
  open: number;

  // the timestamp at which the position was closed. If null, the position is still active
  close: number | null;

  // if enabled, the position won't be taken into account when calculating metrics
  archived: boolean;

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
  decrease_price_levels: IDecreasePriceLevels;

  // the list of increase actions
  increase_actions: IPositionAction[];

  // the list of decrease actions by level
  decrease_actions: IDecreaseActions;
};

/**
 * Compact Position
 * The light representation of a position record containing only essential data.
 */
type ICompactPosition = {
  id: string;
  open: number;
  close: number | null;
  archived: boolean;
  entry_price: number;
  gain: number;
  amount: number;
  amount_quote: number;
  amount_quote_in: number;
  amount_quote_out: number;
  pnl: number;
  roi: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IPositionService,

  // types
  IDecreasePriceLevels,
  IPositionAction,
  IDecreaseActions,
  IMarketStateDependantProps,
  ITradesAnalysis,

  // position
  IPosition,
  ICompactPosition,
};
