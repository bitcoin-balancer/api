/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import {
  integerValid,
  numberValid,
  objectValid,
  stringValid,
} from '../../shared/validations/index.js';
import { ICompactCandlestickRecords } from '../../shared/candlestick/index.js';
import { ExchangeService } from '../../shared/exchange/index.js';
import { IWindowConfig } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the candlesticks match the requirements and can be used to initialize the state.
 * @param candlesticks
 * @param config
 * @throws
 * - 21507: if the number of candlesticks doesn't match the window size
 */
const validateInitialCandlesticks = (
  candlesticks: ICompactCandlestickRecords,
  config: IWindowConfig,
): void => {
  if (candlesticks.id.length !== config.size) {
    throw new Error(encodeError(`The number of candlesticks retrieved from the exchange '${candlesticks.id.length}' doesn't match the window size set in the configuration '${config.size}'`, 21507));
  }
};

/**
 * Ensures the window configuration object can be updated.
 * @param newConfig
 * @throws
 * - 21500: if the config isn't a valid object
 * - 21501: if the refetch frequency is invalid
 * - 21502: if the requirement is invalid
 * - 21503: if the strong requirement is invalid
 * - 21504: if the requirement is greater than or equals to the strong requirement
 * - 21505: if the size of the window is an invalid integer
 * - 21506: if the interval is not supported
 */
const canConfigBeUpdated = (newConfig: IWindowConfig): void => {
  if (!objectValid(newConfig)) {
    console.log(newConfig);
    throw new Error(encodeError('The provided window configuration is not a valid object.', 21500));
  }
  if (!numberValid(newConfig.refetchFrequency, 2.5, 60)) {
    throw new Error(encodeError(`The refetchFrequency '${newConfig.refetchFrequency}' is invalid as it must be a valid number ranging 2.5 and 60.`, 21501));
  }
  if (!integerValid(newConfig.size, 128, 512)) {
    throw new Error(encodeError(`The size '${newConfig.size}' is invalid as it must be a valid integer ranging 128 and 512.`, 21505));
  }
  if (
    !stringValid(newConfig.interval, 2)
    || !ExchangeService.CANDLESTICK_INTERVALS.includes(newConfig.interval)
  ) {
    throw new Error(encodeError(`The candlestick interval '${newConfig.interval}' is invalid. Supported values include: ${JSON.stringify(ExchangeService.CANDLESTICK_INTERVALS)}.`, 21506));
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
  validateInitialCandlesticks,
  canConfigBeUpdated,
};
