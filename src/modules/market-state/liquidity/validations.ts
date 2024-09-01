/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { integerValid, numberValid, objectValid } from '../../shared/validations/index.js';
import { ILiquidityConfig } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if the configuration update can be updated.
 * @param newConfig
 * @throws
 * - 22500: if the new config is not a valid object
 * - 22501: if the max distance from price is invalid
 * - 22502: if the intensity weights is not a valid object
 * - 22503: if any of the intensity weights is invalid
 */
const canConfigBeUpdated = (newConfig: ILiquidityConfig): void => {
  if (!objectValid(newConfig)) {
    console.log(newConfig);
    throw new Error(encodeError('The provided liquidity configuration is not a valid object.', 22500));
  }
  if (!numberValid(newConfig.maxDistanceFromPrice, 0.01, 100)) {
    throw new Error(encodeError(`The maxDistanceFromPrice '${newConfig.maxDistanceFromPrice}' is invalid as it must be a valid number ranging 0.01 and 100.`, 22501));
  }
  if (!objectValid(newConfig.intensityWeights)) {
    console.log(newConfig);
    throw new Error(encodeError('The intensity weights property is not a valid object.', 22502));
  }
  if (!integerValid(newConfig.intensityWeights[1], 1, 100)) {
    throw new Error(encodeError(`The weight for intensity 1 '${newConfig.intensityWeights[1]}' is invalid as it must be a valid integer ranging 1 and 100.`, 22503));
  }
  if (!integerValid(newConfig.intensityWeights[2], 1, 100)) {
    throw new Error(encodeError(`The weight for intensity 2 '${newConfig.intensityWeights[2]}' is invalid as it must be a valid integer ranging 1 and 100.`, 22503));
  }
  if (!integerValid(newConfig.intensityWeights[3], 1, 100)) {
    throw new Error(encodeError(`The weight for intensity 3 '${newConfig.intensityWeights[3]}' is invalid as it must be a valid integer ranging 1 and 100.`, 22503));
  }
  if (!integerValid(newConfig.intensityWeights[4], 1, 100)) {
    throw new Error(encodeError(`The weight for intensity 4 '${newConfig.intensityWeights[4]}' is invalid as it must be a valid integer ranging 1 and 100.`, 22503));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canConfigBeUpdated,
};
