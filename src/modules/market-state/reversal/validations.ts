/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import {
  integerValid,
  numberValid,
  objectValid,
} from '../../shared/validations/index.js';
import { IReversalConfig } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if the configuration update can be updated.
 * @param newConfig
 * @throws
 * - 24500: if the new config is an invalid object
 * - 24501: if the crash duration is invalid
 * - 24502: if the crash idle duration is invalid
 * - 24503: if the points requirement is invalid
 * - 24504: if the weights property is an invalid object
 * - 24505: if the liquidity weight is invalid
 * - 24506: if the coins quote weight is invalid
 * - 24507: if the coins base weight is invalid
 */
const canConfigBeUpdated = (newConfig: IReversalConfig): void => {
  if (!objectValid(newConfig)) {
    console.log(newConfig);
    throw new Error(encodeError('The provided reversal configuration is not a valid object.', 24500));
  }
  if (!integerValid(newConfig.crashDuration, 5, 10080)) {
    throw new Error(encodeError(`The crashDuration '${newConfig.crashDuration}' is invalid as it must be a valid integer ranging 5 and 10080.`, 24501));
  }
  if (!integerValid(newConfig.crashIdleDuration, 0, 1440)) {
    throw new Error(encodeError(`The crashIdleDuration '${newConfig.crashIdleDuration}' is invalid as it must be a valid integer ranging 0 and 1440.`, 24502));
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
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canConfigBeUpdated,
};
