/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import {
  objectValid,
  timestampValid,
  stringValid,
  numberValid,
  integerValid,
} from '../../shared/validations/index.js';
import { IManualTrade } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Validates the identifier for a record.
 * @param id
 * @throws
 * - 33507: if the record's ID has an invalid format
 */
const validateTradeRecordID = (id: number): void => {
  if (!integerValid(id, 1, Number.MAX_SAFE_INTEGER)) {
    throw new Error(encodeError(`The identifier '${id}' is not a valid trade ID.`, 33507));
  }
};

/**
 * Ensures a manual trades contains all the required properties with valid values.
 * @param record
 * @throws
 * - 33500: if the record is not an object
 * - 33501: if the event_time is an invalid
 * - 33502: if the timestamp is set ahead of time
 * - 33503: if the side of the record is invalid
 * - 33504: if the notes are invalid
 * - 33505: if the price is invalid
 * - 33506: if the amount is invalid
 */
const validateManualTradeRecord = (record: IManualTrade): void => {
  if (!objectValid(record)) {
    console.log(record);
    throw new Error(encodeError('The trade record is not a valid object.', 33500));
  }
  if (!timestampValid(record.event_time)) {
    throw new Error(encodeError(`The event_time '${record.event_time}' is not a valid timestamp.`, 33501));
  }
  if (record.event_time > Date.now()) {
    throw new Error(encodeError(`The event_time '${record.event_time}' is invalid as it cannot be set ahead of time.`, 33502));
  }
  if (record.side !== 'BUY' && record.side !== 'SELL') {
    throw new Error(encodeError(`The side '${record.side}' is invalid. Only 'BUY' and 'SELL' are accepted.`, 33503));
  }
  if (!stringValid(record.notes, 10, 49999)) {
    throw new Error(encodeError('The notes must be a valid string ranging 10 and 49,999 characters in length.', 33504));
  }
  if (!numberValid(record.price, 0.01, Number.MAX_SAFE_INTEGER)) {
    throw new Error(encodeError(`The price '${record.price}' is invalid as it must be a valid number ranging 0.01 - ${Number.MAX_SAFE_INTEGER}.`, 33505));
  }
  if (!numberValid(record.amount, 0.00000001, Number.MAX_SAFE_INTEGER)) {
    throw new Error(encodeError(`The amount '${record.amount}' is invalid as it must be a valid number ranging 0.00000001 - ${Number.MAX_SAFE_INTEGER}.`, 33506));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateTradeRecordID,
  validateManualTradeRecord,
};
