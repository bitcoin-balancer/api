import { encodeError } from 'error-message-utils';
import { integerValid } from '../shared/validations/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the startAtID is valid in case it was provided.
 * @param startAtID
 * @throws
 * - 1: if the startAtID was provided and is not a valid identifier
 */
const canRecordsBeListed = (startAtID: number | undefined): void => {
  if (startAtID !== undefined && !integerValid(startAtID, 1)) {
    throw new Error(encodeError(`The API Errors cannot be listed with an invalid startAtID. Received: ${startAtID}.`, 1000));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canRecordsBeListed,
};
