/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import {
  integerValid,
  numberValid,
  objectValid,
  uuidValid,
} from '../../shared/validations/index.js';
import { IReversalConfig } from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the maximum number of records that can be queried at a time
const __QUERY_LIMIT: number = 30;





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if a record can be retrieved for an identifier.
 * @param id
 * @throws
 * - 24509: if the ID is not a valid UUID v4
 */
const canRecordBeRetrieved = (id: string): void => {
  if (!uuidValid(id)) {
    throw new Error(encodeError(`The record for ID '${id}' cannot be retrieved because it isn't a valid UUID v4.`, 24509));
  }
};

/**
 * Ensures a list of price crash state records can be retrieved.
 * @param limit
 * @param startAtEventTime
 * @throws
 * - 24510: if the desired number of records exceeds the limit
 * - 24511: if the startAtEventTime was provided and is invalid
 */
const canRecordsBeListed = (limit: number, startAtEventTime: number | undefined): void => {
  if (!integerValid(limit, 1, __QUERY_LIMIT)) {
    throw new Error(encodeError(`The maximum number of Price Crash State Records that can be retrieved at a time is ${__QUERY_LIMIT}. Received: ${limit}`, 24510));
  }
  if (startAtEventTime !== undefined && !integerValid(startAtEventTime, 1)) {
    throw new Error(encodeError(`The Price Crash State Records cannot be listed with an invalid startAtEventTime. Received: ${startAtEventTime}.`, 24511));
  }
};

/**
 * Verifies if the configuration update can be updated.
 * @param newConfig
 * @throws
 * - 24500: if the new config is an invalid object
 * - 24501: if the crash duration is invalid
 * - 24503: if the points requirement is invalid
 * - 24504: if the weights property is an invalid object
 * - 24505: if the liquidity weight is invalid
 * - 24506: if the coins quote weight is invalid
 * - 24507: if the coins base weight is invalid
 * - 24508: if adding the weights doesn't result in 100
 */
const canConfigBeUpdated = (newConfig: IReversalConfig): void => {
  if (!objectValid(newConfig)) {
    console.log(newConfig);
    throw new Error(encodeError('The provided reversal configuration is not a valid object.', 24500));
  }
  if (!integerValid(newConfig.crashDuration, 5, 10080)) {
    throw new Error(encodeError(`The crashDuration '${newConfig.crashDuration}' is invalid as it must be a valid integer ranging 5 and 10080.`, 24501));
  }
  if (!numberValid(newConfig.pointsRequirement, 50, 100)) {
    throw new Error(encodeError(`The pointsRequirement '${newConfig.pointsRequirement}' is invalid as it must be a valid number ranging 50 and 100.`, 24503));
  }
  if (!objectValid(newConfig.weights)) {
    console.log(newConfig);
    throw new Error(encodeError('The weights property is not a valid object.', 24504));
  }
  if (!numberValid(newConfig.weights.liquidity, 1, 100)) {
    throw new Error(encodeError(`The weight for liquidity '${newConfig.weights.liquidity}' is invalid as it must be a valid number ranging 1 and 100.`, 24505));
  }
  if (!numberValid(newConfig.weights.coinsQuote, 1, 100)) {
    throw new Error(encodeError(`The weight for coins quote '${newConfig.weights.coinsQuote}' is invalid as it must be a valid number ranging 1 and 100.`, 24506));
  }
  if (!numberValid(newConfig.weights.coinsBase, 1, 100)) {
    throw new Error(encodeError(`The weight for coins base '${newConfig.weights.coinsBase}' is invalid as it must be a valid number ranging 1 and 100.`, 24507));
  }
  const total = newConfig.weights.liquidity
    + newConfig.weights.coinsQuote
    + newConfig.weights.coinsBase;
  if (total !== 100) {
    throw new Error(encodeError(`The sum of the weights must total 100. Received ${total}`, 24508));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canRecordBeRetrieved,
  canRecordsBeListed,
  canConfigBeUpdated,
};
