import { encodeError } from 'error-message-utils';
import { integerValid, timestampValid, uuidValid } from '../shared/validations/index.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the maximum number of compact position records that can be queried at a time
const __QUERY_LIMIT = 30;





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
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
const canCompactPositionRecordsBeListed = async (
  limit: number,
  startAtOpenTime: number | undefined,
): Promise<void> => {
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
 */
const canCompactPositionRecordsBeListedByRange = async (
  startAt: number,
  endAt: number | undefined,
): Promise<void> => {
  if (!timestampValid(startAt)) {
    throw new Error(encodeError(`The startAt '${startAt}' is not a valid timestamp.`, 30503));
  }
  if (endAt !== undefined && !timestampValid(endAt)) {
    throw new Error(encodeError(`If the endAt arg is provided, it must be a valid timestamp. Received: ${endAt}`, 30504));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canPositionRecordBeRetrieved,
  canCompactPositionRecordsBeListed,
  canCompactPositionRecordsBeListedByRange,
};
