/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { numberValid, objectValid } from '../../shared/validations/index.js';
import { IWindowConfig } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the window configuration object can be updated.
 * @param newConfig
 * @throws
 * - 21500: if the config isn't a valid object
 * - 21501: if the refetch frequency is invalid
 * - 21502: if the requirement is invalid
 * - 21503: if the strong requirement is invalid
 * - 21504: if the requirement is greater than or equals to the strong requirement
 */
const canConfigBeUpdated = (newConfig: IWindowConfig): void => {
  if (!objectValid(newConfig)) {
    console.log(newConfig);
    throw new Error(encodeError('The provided window configuration is not a valid object.', 21500));
  }
  if (!numberValid(newConfig.refetchFrequency, 2.5, 60)) {
    throw new Error(encodeError(`The refetchFrequency '${newConfig.refetchFrequency}' is invalid as it must be a valid number ranging 2.5 and 60.`, 21501));
  }
  if (!numberValid(newConfig.requirement, 0.01, 100)) {
    throw new Error(encodeError(`The requirement '${newConfig.requirement}' is invalid as it must be a valid number ranging 1 and 100.`, 21502));
  }
  if (!numberValid(newConfig.strongRequirement, 0.01, 100)) {
    throw new Error(encodeError(`The strongRequirement '${newConfig.strongRequirement}' is invalid as it must be a valid number ranging 1 and 100.`, 21503));
  }
  if (newConfig.requirement >= newConfig.strongRequirement) {
    throw new Error(encodeError(`The requirement '${newConfig.requirement}' must be less than the strong requirement '${newConfig.strongRequirement}'.`, 21504));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canConfigBeUpdated,
};
