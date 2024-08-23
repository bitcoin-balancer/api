/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { arrayValid, numberValid, objectValid } from '../../shared/validations/index.js';
import { ICoinsConfig } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the window configuration object can be updated.
 * @param newConfig
 * @throws
 * - 
 */
const canConfigBeUpdated = (newConfig: ICoinsConfig): void => {
  if (!objectValid(newConfig)) {
    console.log(newConfig);
    throw new Error(encodeError('The provided coins configuration is not a valid object.', 23500));
  }
  if (!numberValid(newConfig.size, 128, 512)) {
    throw new Error(encodeError(`The size '${newConfig.size}' is invalid as it must be a valid number ranging 128 and 512.`, 23501));
  }
  if (!numberValid(newConfig.interval, 5, 3600)) {
    throw new Error(encodeError(`The interval '${newConfig.interval}' is invalid as it must be a valid number ranging 5 and 3600 seconds.`, 23502));
  }
  if (!numberValid(newConfig.requirement, 0.01, 100)) {
    throw new Error(encodeError(`The requirement '${newConfig.requirement}' is invalid as it must be a valid number ranging 1 and 100.`, 23503));
  }
  if (!numberValid(newConfig.strongRequirement, 0.01, 100)) {
    throw new Error(encodeError(`The strongRequirement '${newConfig.strongRequirement}' is invalid as it must be a valid number ranging 1 and 100.`, 23504));
  }
  if (!arrayValid(newConfig.whitelistedSymbols)) {
    console.log(newConfig.whitelistedSymbols);
    throw new Error(encodeError('The whitelistedSymbols property is not a valid array.', 23505));
  }
  // validate the symbols
  // @TODO
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canConfigBeUpdated,
};
