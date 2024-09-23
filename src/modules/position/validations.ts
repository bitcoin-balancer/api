import { encodeError } from 'error-message-utils';
import {
  integerValid,
  numberValid,
  timestampValid,
  uuidValid,
} from '../shared/validations/index.js';
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
  if (!uuidValid(id)) {
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
};
