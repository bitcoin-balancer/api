/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { isUUIDValid, sortRecords } from 'web-utils-kit';
import { calculateWeightedEntry } from 'bignumber-utils';
import {
  integerValid,
  numberValid,
  objectValid,
  timestampValid,
} from '../shared/validations/index.js';
import { ITrade } from '../shared/exchange/index.js';
import { IManualTrade, TradeService } from './trade/index.js';
import { calculateTradesAnalysisAmounts } from './utils.js';
import { IPosition } from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the maximum number of compact position records that can be queried at a time
const __QUERY_LIMIT = 30;

// the maximum difference between the startAt and the endAt properties in milliseconds
const __DATE_RANGE_LIMIT = (6 * (365 * (24 * (60 * 60)))) * 1000; // ~6 years





/* ************************************************************************************************
 *                                            ACTIONS                                             *
 ************************************************************************************************ */

/**
 * Verifies if an active position can be decreased based on a percentage.
 * @param active
 * @param percentage
 * @throws
 * - 30507: if there isn't an active position
 * - 30508: if the percentage is not a valid number
 */
const canPositionBeDecreased = (active: IPosition | undefined, percentage: number): void => {
  if (active === undefined) {
    throw new Error(encodeError('A decrease action can only be performed if there is an active position.', 30507));
  }
  if (!numberValid(percentage, 1, 100)) {
    throw new Error(encodeError(`The decrease percentage must be a valid number ranging 1 - 100. Received: ${percentage}`, 30508));
  }
};

/**
 * Verifies if a position can be archived.
 * @param id
 * @param active
 * @param position
 * @throws
 * - 30509: if the positon doesn't exist
 * - 30510: if the positon has already been archived
 * - 30512: if the positon is currently active
 */
const canPositionBeArchived = (
  id: string,
  active: IPosition | undefined,
  position: IPosition | undefined,
): void => {
  if (position === undefined) {
    throw new Error(encodeError(`The position '${id}' cannot be archived because it doesn't exist.`, 30509));
  }
  if (position.archived) {
    throw new Error(encodeError(`The position '${id}' cannot be archived because it has already been.`, 30510));
  }
  if (active && active.id === id) {
    throw new Error(encodeError(`The position '${id}' cannot be archived because it is active.`, 30512));
  }
};

/**
 * Verifies if a position can be unarchived.
 * @param id
 * @param position
 * @throws
 * - 30509: if the positon doesn't exist
 * - 30511: if the positon is not archived
 */
const canPositionBeUnarchived = (id: string, position: IPosition | undefined): void => {
  if (position === undefined) {
    throw new Error(encodeError(`The position '${id}' cannot be archived because it doesn't exist.`, 30509));
  }
  if (!position.archived) {
    throw new Error(encodeError(`The position '${id}' cannot be unarchived because it is not archived.`, 30511));
  }
};





/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Verifies if a record can be retrieved for an ID.
 * @param id
 * @throws
 * - 30500: if the ID is not a valid uuid v4
 */
const canPositionRecordBeRetrieved = (id: string): void => {
  if (!isUUIDValid(id, 4)) {
    throw new Error(encodeError(`The position record cannot be retrieved for an invalid ID '${id}'.`, 30500));
  }
};

/**
 * Verifies if a series of compact position records can be listed.
 * @param limit
 * @param startAtOpenTime
 * @throws
 * - 30501: if the number of requested records exceeds the limit
 * - 30502: if the startAtOpenTime is not a valid timestamp
 */
const canCompactPositionRecordsBeListed = (
  limit: number,
  startAtOpenTime: number | undefined,
): void => {
  if (!integerValid(limit, 1, __QUERY_LIMIT)) {
    throw new Error(encodeError(`The maximum number of compact position records that can be retrieved at a time is ${__QUERY_LIMIT}. Received: ${limit}`, 30501));
  }
  if (startAtOpenTime !== undefined && !timestampValid(startAtOpenTime)) {
    throw new Error(encodeError(`If the startAtOpenTime arg is provided, it must be a valid timestamp. Received: ${startAtOpenTime}`, 30502));
  }
};

/**
 * Verifies if a series of compact position records can be listed by range.
 * @param startAt
 * @param endAt
 * @throws
 * - 30503: if the startAt timestamp is invalid
 * - 30504: if an invalid endAt is provided
 * - 30505: if the startAt is greater than or equals than the endAt
 * - 30506: if the difference between the startAt and the endAt exceeds the limit
 */
const canCompactPositionRecordsBeListedByRange = (
  startAt: number,
  endAt: number | undefined,
): void => {
  if (!timestampValid(startAt)) {
    throw new Error(encodeError(`The startAt '${startAt}' is not a valid timestamp.`, 30503));
  }
  if (endAt !== undefined && !timestampValid(endAt)) {
    throw new Error(encodeError(`If the endAt arg is provided, it must be a valid timestamp. Received: ${endAt}`, 30504));
  }
  if (typeof endAt === 'number' && startAt >= endAt) {
    throw new Error(encodeError(`If startAt '${startAt}' must be less than the endAt '${endAt}'.`, 30505));
  }
  if (((typeof endAt === 'number' ? endAt : Date.now()) - startAt) >= __DATE_RANGE_LIMIT) {
    throw new Error(encodeError('The difference between the startAt and the endAt cannot be larger than 6 years.', 30506));
  }
};





/* ************************************************************************************************
 *                                        TRADE MANAGEMENT                                        *
 ************************************************************************************************ */

/**
 * Ensures the Position Module's state can handle interactions with the position's trades.
 * @param activePosition
 * @param trade
 * @throws
 * - 33500: if the record is not an object
 * - 33501: if the event_time is an invalid
 * - 33502: if the timestamp is set ahead of time
 * - 33503: if the side of the record is invalid
 * - 33504: if the notes are invalid
 * - 33505: if the price is invalid
 * - 33506: if the amount is invalid
 * - 30513: if there isn't an active position
 * - 30517: if the timestamp of the trade is older than the position's open time
 */
const canInteractWithPositionTrades = (
  activePosition: IPosition | undefined,
  trade?: IManualTrade,
): void => {
  if (!objectValid(activePosition)) {
    throw new Error(encodeError('There must be an active position to be able to interact with trades.', 30513));
  }
  if (trade !== undefined) {
    // validate the integrity of the trade object
    TradeService.validateManualTrade(trade);

    // ensure the timestamp took place after the position was opened
    if (trade.event_time < activePosition.open) {
      throw new Error(encodeError('The time of the trade must be set after the position was opened.', 30517));
    }
  }
};

/**
 * Dry-runs the trades calculations and ensures the given state can be fully committed.
 * @param trades
 * @throws
 * - 30514: if there no items in the list of trades
 * - 30515: if the state causes the amount to be less than 0
 * - 30516: if the state causes the entry price to be less than or equals to 0
 * - 30519: if the first trade is a sell
 */
const __canTradesStateBeCommitted = (trades: ITrade[]): void => {
  // ensure there are trades
  if (trades.length === 0) {
    throw new Error(encodeError('The trades\' state cannot be committed because the list is empty.', 30514));
  }

  // the first trade can never be a sell
  if (trades[0].side === 'SELL') {
    console.log(trades);
    throw new Error(encodeError('The first trade from the list cannot be a SELL execution.', 30519));
  }

  // calculate the amounts based on the trades
  const { amount, buyTrades } = calculateTradesAnalysisAmounts(trades);

  // the amount cannot be negative
  if (amount.isLessThan(0)) {
    throw new Error(encodeError(`The trades' state cannot be committed because the amount of the position must be a positive number. The provided state resulted in: ${amount.toString()}`, 30515));
  }

  // calculate the new entry price and validate it
  const entryPrice = calculateWeightedEntry(buyTrades);
  if (entryPrice <= 0) {
    throw new Error(encodeError(`The trades' state cannot be committed because the entry price of the position must be greater than 0. The provided state resulted in: ${entryPrice}`, 30516));
  }
};

/**
 * Verifies if creating a trade maintains the integrity of the position.
 * @param rawTrades
 * @param trade
 * @throws
 * - 30514: if there no items in the list of trades
 * - 30515: if the state causes the amount to be less than 0
 * - 30516: if the state causes the entry price to be less than or equals to 0
 * - 30519: if the first trade is a sell
 */
const canTradeBeCreated = (
  rawTrades: ITrade[],
  trade: ITrade,
): void => __canTradesStateBeCommitted([...rawTrades, trade].sort(sortRecords('event_time', 'asc')));

/**
 * Verifies if updating a trade maintains the integrity of the position.
 * @param rawTrades
 * @param id
 * @param trade
 * @throws
 * - 33507: if the record's ID has an invalid format
 * - 30518: if the trade doesn't exist
 * - 30514: if there no items in the list of trades
 * - 30515: if the state causes the amount to be less than 0
 * - 30516: if the state causes the entry price to be less than or equals to 0
 * - 30519: if the first trade is a sell
 */
const canTradeBeUpdated = async (
  rawTrades: ITrade[],
  id: number,
  trade: ITrade,
): Promise<void> => {
  // make sure the trade exists
  TradeService.validateTradeID(id);
  if (await TradeService.getTrade(id) === undefined) {
    throw new Error(encodeError(`The trade '${id}' was not found in the database.`, 30518));
  }

  // check if the state can be committed
  __canTradesStateBeCommitted(
    rawTrades.map((record) => {
      if (record.id === trade.id) {
        return trade;
      }
      return record;
    }).sort(sortRecords('event_time', 'asc')),
  );
};

/**
 * Verifies if deleting a trade maintains the integrity of the position.
 * @param rawTrades
 * @param id
 * @throws
 * - 33507: if the record's ID has an invalid format
 * - 30518: if the trade doesn't exist
 * - 30514: if there no items in the list of trades
 * - 30515: if the state causes the amount to be less than 0
 * - 30516: if the state causes the entry price to be less than or equals to 0
 * - 30519: if the first trade is a sell
 */
const canTradeBeDeleted = async (
  rawTrades: ITrade[],
  id: number,
): Promise<void> => {
  // make sure the trade exists
  TradeService.validateTradeID(id);
  if (await TradeService.getTrade(id) === undefined) {
    throw new Error(encodeError(`The trade '${id}' was not found in the database.`, 30518));
  }

  // check if the state can be committed
  __canTradesStateBeCommitted(rawTrades.filter((trade) => trade.id !== id));
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // actions
  canPositionBeDecreased,
  canPositionBeArchived,
  canPositionBeUnarchived,

  // retrievers
  canPositionRecordBeRetrieved,
  canCompactPositionRecordsBeListed,
  canCompactPositionRecordsBeListedByRange,

  // trade management
  canInteractWithPositionTrades,
  canTradeBeCreated,
  canTradeBeUpdated,
  canTradeBeDeleted,
};
