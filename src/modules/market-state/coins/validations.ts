/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import {
  arrayValid,
  integerValid,
  numberValid,
  objectValid,
  symbolValid,
} from '../../shared/validations/index.js';
import {
  ICoinsConfig,
  ICoinState,
  ICoinStateAsset,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the coin state asset is valid.
 * @param asset
 * @throws
 * - 23508: if the state asset is invalid
 */
const validateStateAsset = (asset: ICoinStateAsset): void => {
  if (asset !== 'base' && asset !== 'quote') {
    throw new Error(encodeError(`The state asset '${asset}' is not supported.`, 23508));
  }
};

/**
 * Ensures the state asset and the symbol are val
 * @param symbol
 * @param asset
 * @param statesBySymbol
 * @throws
 * - 23508: if the state asset is invalid
 * - 23510: if the symbol is not in the asset's statesBySymbol object
 */
const validateSymbol = (
  symbol: string,
  asset: ICoinStateAsset,
  statesBySymbol: { [symbol:string]: ICoinState },
): void => {
  validateStateAsset(asset);
  if (!statesBySymbol[symbol]) {
    throw new Error(encodeError(`The symbol '${asset}' is not listed in the ${asset}'s symbols.`, 23510));
  }
};


/**
 * Ensures the window configuration object can be updated.
 * @param newConfig
 * @throws
 * - 23500: if the config isn't a valid object
 * - 23501: if the window size is invalid
 * - 23502: if the interval is invalid
 * - 23503: if the state requirement is invalid
 * - 23504: if the strong state requirement is invalid
 * - 23505: if the whitelisted symbols is an invalid array
 * - 23506: if any of the whitelisted symbols is invalid
 * - 23507: if the limit is invalid
 * - 23509: if the whitelist doesn't include the base asset
 * - 23511: if the requirement is equals or larger than the strongRequirement
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
  if (newConfig.requirement >= newConfig.strongRequirement) {
    throw new Error(encodeError(`The requirement '${newConfig.requirement}' must be less than the strong requirement '${newConfig.strongRequirement}'.`, 23511));
  }
  if (!integerValid(newConfig.limit, 1, 24)) {
    throw new Error(encodeError(`The limit '${newConfig.limit}' is invalid as it must be a valid integer ranging 1 and 24.`, 23507));
  }
  if (!arrayValid(newConfig.whitelistedSymbols)) {
    console.log(newConfig.whitelistedSymbols);
    throw new Error(encodeError('The whitelistedSymbols property is not a valid array.', 23505));
  }
  newConfig.whitelistedSymbols.forEach((symbol) => {
    if (!symbolValid(symbol)) {
      throw new Error(encodeError(`The whitelisted symbol '${symbol}' is invalid as it must only contain uppercased letters and/or numbers.`, 23506));
    }
  });
  if (!newConfig.whitelistedSymbols.includes(ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset)) {
    throw new Error(encodeError(`The symbols whitelist does not include the base asset '${ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset}'.`, 23509));
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateStateAsset,
  validateSymbol,
  canConfigBeUpdated,
};
