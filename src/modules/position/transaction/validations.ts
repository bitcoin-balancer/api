import { encodeError } from 'error-message-utils';
import { isIntegerValid } from 'web-utils-kit';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the maximum number of records that can be queried at a time
const __QUERY_LIMIT: number = 30;

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if a record can be retrieved from the database.
 * @param id
 * @throws
 * - 32500: if the identifier is invalid
 */
const canTransactionBeRetrieved = (id: number): void => {
  if (!isIntegerValid(id, 1)) {
    throw new Error(
      encodeError(`The transaction cannot be retrieved for an invalid id. Received: ${id}`, 32500),
    );
  }
};

/**
 * Ensures a list of Transactions can be retrieved.
 * @param limit
 * @param startAtID
 * @throws
 * - 32501: if the query limit is larger than the limit
 * - 32502: if the startAtID was provided and is not a valid identifier
 */
const canRecordsBeListed = (limit: number, startAtID: number | undefined): void => {
  if (!isIntegerValid(limit, 1, __QUERY_LIMIT)) {
    throw new Error(
      encodeError(
        `The maximum number of transactions that can be retrieved at a time is ${__QUERY_LIMIT}. Received: ${limit}`,
        32501,
      ),
    );
  }
  if (startAtID !== undefined && !isIntegerValid(startAtID, 1)) {
    throw new Error(
      encodeError(
        `The transactions cannot be listed with an invalid startAtID. Received: ${startAtID}.`,
        32502,
      ),
    );
  }
};

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { canTransactionBeRetrieved, canRecordsBeListed };
