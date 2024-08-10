import { encodeError } from 'error-message-utils';
import { integerValid } from '../shared/validations/index.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the maximum number of records that can be queried at a time
const __QUERY_LIMIT: number = 30;





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures a list of records can be retrieved.
 * @param limit
 * @param startAtID
 * @throws
 * - 1000: if the startAtID was provided and is not a valid identifier
 * - 1001: if the query limit is larger than the limit
 */
const canRecordsBeListed = (limit: number, startAtID: number | undefined): void => {
  if (!integerValid(limit, 1, __QUERY_LIMIT)) {
    throw new Error(encodeError(`The maximum number of API Errors that can be retrieved at a time is ${__QUERY_LIMIT}. Received: ${limit}`, 10500));
  }
  if (startAtID !== undefined && !integerValid(startAtID, 1)) {
    throw new Error(encodeError(`The API Errors cannot be listed with an invalid startAtID. Received: ${startAtID}.`, 10501));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canRecordsBeListed,
};
