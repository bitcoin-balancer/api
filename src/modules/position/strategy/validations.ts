/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import {
  isNumberValid,
  isIntegerValid,
  isObjectValid,
  isArrayValid,
} from 'web-utils-kit';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { IDecreaseLevel, IStrategy } from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the maximum value allowed for the gainRequirement property
const __MAX_GAIN_REQUIREMENT = 1000000;

// the maximum value allowed for decrease levels (~30 days)
const __MAX_FREQUENCY = 43200;

// To prevent automatic closure of positions, ensure the quote asset amount used to buy BTC always
// exceeds PositionService.__MIN_ORDER_SIZE. Positions with a quote asset amount below this
// threshold will be automatically closed at the database level, without selling the BTC
// For example, a __MIN_INCREASE_AMOUNT_QUOTE will only work until BTC is worth $500,000.
// 0.0002 * 500000 = 100
const __MIN_INCREASE_AMOUNT_QUOTE = ENVIRONMENT.NODE_ENV === 'production' ? 100 : 25;





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if the configuration update can be updated.
 * @param newConfig
 * @throws
 * - 31500: if the config is not a valid object
 * - 31501: if the canIncrease property is not a boolean
 * - 31502: if the canDecrease property is not a boolean
 * - 31503: if the increaseAmountQuote property is not a valid number
 * - 31505: if the increaseIdleDuration property is not a valid number
 * - 31506: if the increaseGainRequirement property is not a valid number
 * - 31507: if the decreaseLevels property is not a valid tuple
 * - 31508: if any of the price levels' gainRequirement property is invalid
 * - 31509: if any of the price levels' percentage property is invalid
 * - 31510: if any of the price levels' frequency property is invalid
 */
const canConfigBeUpdated = (newConfig: IStrategy): void => {
  if (!isObjectValid(newConfig)) {
    console.log(newConfig);
    throw new Error(encodeError('The provided strategy is not a valid object.', 31500));
  }
  if (typeof newConfig.canIncrease !== 'boolean') {
    throw new Error(encodeError(`The canIncrease '${newConfig.canIncrease}' must be a boolean value.`, 31501));
  }
  if (typeof newConfig.canDecrease !== 'boolean') {
    throw new Error(encodeError(`The canDecrease '${newConfig.canDecrease}' must be a boolean value.`, 31502));
  }
  if (!isNumberValid(
    newConfig.increaseAmountQuote,
    __MIN_INCREASE_AMOUNT_QUOTE,
    Number.MAX_SAFE_INTEGER,
  )) {
    throw new Error(encodeError(`The increaseAmountQuote '${newConfig.increaseAmountQuote}' is invalid as it must be a valid number ranging ${__MIN_INCREASE_AMOUNT_QUOTE} and ${Number.MAX_SAFE_INTEGER}.`, 31503));
  }
  if (!isNumberValid(newConfig.increaseIdleDuration, 1, 1440)) {
    throw new Error(encodeError(`The increaseIdleDuration '${newConfig.increaseIdleDuration}' is invalid as it must be a valid number ranging 1 and 1440.`, 31505));
  }
  if (!isNumberValid(newConfig.increaseGainRequirement, -99, 0)) {
    throw new Error(encodeError(`The increaseGainRequirement '${newConfig.increaseGainRequirement}' is invalid as it must be a valid number ranging -99 and 0.`, 31506));
  }
  if (!isArrayValid(newConfig.decreaseLevels) || newConfig.decreaseLevels.length !== 5) {
    throw new Error(encodeError('The decreaseLevels property doesn\'t contain a valid tuple with 5 items.', 31507));
  }
  let previous: IDecreaseLevel | undefined;
  newConfig.decreaseLevels.forEach((level, i) => {
    const minGainRequirement = previous === undefined ? 0.1 : previous.gainRequirement + 0.01;
    const minPercentage = previous === undefined ? 1 : previous.percentage;
    const maxFrequency = previous === undefined ? __MAX_FREQUENCY : previous.frequency;
    if (!isNumberValid(level.gainRequirement, minGainRequirement, __MAX_GAIN_REQUIREMENT)) {
      throw new Error(encodeError(`The gainRequirement for level ${i} '${level.gainRequirement}' is invalid as it must be a valid number ranging ${minGainRequirement} and ${__MAX_GAIN_REQUIREMENT}.`, 31508));
    }
    if (!isNumberValid(level.percentage, minPercentage, 100)) {
      throw new Error(encodeError(`The percentage for level ${i} '${level.percentage}' is invalid as it must be a valid number ranging ${minPercentage} and 100.`, 31509));
    }
    if (!isIntegerValid(level.frequency, 3, maxFrequency)) {
      throw new Error(encodeError(`The frequency for level ${i} '${level.frequency}' is invalid as it must be a valid integer ranging 3 and ${maxFrequency}.`, 31510));
    }
    previous = level;
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canConfigBeUpdated,
};
