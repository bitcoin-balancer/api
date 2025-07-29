import {
  isStringValid,
  isObjectValid,
  isSlugValid,
  isPasswordValid,
  isOTPSecretValid,
  isUUIDValid,
} from 'web-utils-kit';
import {
  IRootAccountConfig,
  ITelegramConfig,
  IJWTSecretConfig,
  IExchangeID,
  IExchangesCredentials,
  IExchangeConfig,
} from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the list of supported base assets
const BASE_ASSETS = ['BTC'];

// the list of supported quote assets
const QUOTE_ASSETS = ['USDT', 'USDC', 'DAI', 'FDUSD', 'PYUSD', 'USDD', 'TUSD'];

// the list of exchange ids supported by Balancer
const EXCHANGE_IDS: IExchangeID[] = ['binance', 'bitfinex', 'coinbase', 'kraken', 'okx'];

/* ************************************************************************************************
 *                                          ROOT ACCOUNT                                          *
 ************************************************************************************************ */

/**
 * Validates the root account's configuration object.
 * @param config
 * @throws
 * - if any of the configuration properties is invalid
 */
const validateRootAccountConfig = (config: IRootAccountConfig): void => {
  if (!isObjectValid(config))
    throw new Error(
      `The environment property ROOT_ACCOUNT is not a valid object. Received: ${JSON.stringify(config)}`,
    );
  if (!isUUIDValid(config.uid, 4))
    throw new Error(
      `The environment property ROOT_ACCOUNT.uid is not a valid UUID. Received: ${config.uid}`,
    );
  if (!isSlugValid(config.nickname))
    throw new Error(
      `The environment property ROOT_ACCOUNT.nickname is not a valid nickname. Received: ${config.nickname}`,
    );
  if (!isPasswordValid(config.password))
    throw new Error(
      `The environment property ROOT_ACCOUNT.password is not a valid password. Received: ${config.password}`,
    );
  if (!isOTPSecretValid(config.otpSecret))
    throw new Error(
      `The environment property ROOT_ACCOUNT.otpSecret is not a valid secret. Received: ${config.otpSecret}`,
    );
};

/* ************************************************************************************************
 *                                            TELEGRAM                                            *
 ************************************************************************************************ */

/**
 * Validates the telegram's configuration object.
 * @param config
 * @throws
 * - if any of the configuration properties is invalid
 */
const validateTelegramConfig = (config: ITelegramConfig): void => {
  if (!isObjectValid(config))
    throw new Error(
      `The environment property TELEGRAM is not a valid object. Received: ${JSON.stringify(config)}`,
    );
  if (typeof config.token !== 'string')
    throw new Error(
      `The environment property TELEGRAM.token is not a valid string. Received: ${config.token}`,
    );
  if (typeof config.chatID !== 'number')
    throw new Error(
      `The environment property TELEGRAM.chatID is not a valid number. Received: ${config.chatID}`,
    );
};

/* ************************************************************************************************
 *                                           JWT SECRET                                           *
 ************************************************************************************************ */

/**
 * Validates the JWT Secret's configuration object.
 * @param config
 * @throws
 * - if any of the configuration properties is invalid
 */
const validateJWTSecretConfig = (config: IJWTSecretConfig): void => {
  if (!isObjectValid(config))
    throw new Error(
      `The environment property JWT_SECRET is not a valid object. Received: ${JSON.stringify(config)}`,
    );
  if (!isStringValid(config.refresh, 1))
    throw new Error(
      `The environment property JWT_SECRET.refresh is not a valid string. Received: ${config.refresh}`,
    );
  if (!isStringValid(config.access, 1))
    throw new Error(
      `The environment property JWT_SECRET.access is not a valid string. Received: ${config.access}`,
    );
};

/* ************************************************************************************************
 *                                            EXCHANGE                                            *
 ************************************************************************************************ */

/**
 * Validates the credentials for an Exchange ID.
 * @param module
 * @param id
 * @param credentials
 * @throws
 * - if the ID is invalid or unsupported
 * - if the credentials for the exchange weren't provided or are invalid
 */
const __validateExchangeCredentials = (
  module: 'window' | 'liquidity' | 'coins' | 'trading',
  id: IExchangeID,
  credentials: IExchangesCredentials,
): void => {
  if (!isStringValid(id, 1) || !EXCHANGE_IDS.includes(id)) {
    throw new Error(`The Exchange ID '${id}' (${module}) is not supported by Balancer.`);
  }
  if (
    !isObjectValid(credentials[id]) ||
    !isStringValid(credentials[id].key, 1) ||
    !isStringValid(credentials[id].secret, 1)
  ) {
    throw new Error(
      `The credentials for the exchange '${id}' (${module}) are invalid or were not provided.`,
    );
  }
};

/**
 * Validates the exchanges' configuration and credentials.
 * @param config
 * @param credentials
 * @throws
 * - if the EXCHANGES_CONFIGURATION is not a valid object
 * - if the EXCHANGES_CREDENTIALS is not a valid object
 * - if any of the IDs is invalid or unsupported
 * - if any of the credentials for the exchange weren't provided or are invalid
 */
const validateExchangesConfigAndCreds = (
  config: IExchangeConfig,
  credentials: IExchangesCredentials,
): void => {
  // ensure the config and the credentials are valid objects
  if (!isObjectValid(config)) {
    throw new Error(
      `The environment property EXCHANGES_CONFIGURATION is not a valid object. Received: ${JSON.stringify(config)}`,
    );
  }
  if (!isObjectValid(credentials)) {
    throw new Error('The environment property EXCHANGES_CREDENTIALS is not a valid object.');
  }

  // ensure the base and quote assets were provided
  if (!isStringValid(config.baseAsset) || !BASE_ASSETS.includes(config.baseAsset)) {
    throw new Error(
      `The base asset '${config.baseAsset}' is invalid. Supported base assets are: ${JSON.stringify(BASE_ASSETS)}`,
    );
  }
  if (!isStringValid(config.quoteAsset) || !QUOTE_ASSETS.includes(config.quoteAsset)) {
    throw new Error(
      `The quote asset '${config.quoteAsset}' is invalid. Supported quote assets are: ${JSON.stringify(QUOTE_ASSETS)}`,
    );
  }

  // ensure all the credentials were provided
  __validateExchangeCredentials('window', config.window, credentials);
  __validateExchangeCredentials('liquidity', config.liquidity, credentials);
  __validateExchangeCredentials('coins', config.coins, credentials);
  __validateExchangeCredentials('trading', config.trading, credentials);
};

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // root account
  validateRootAccountConfig,

  // telegram
  validateTelegramConfig,

  // jwt secret
  validateJWTSecretConfig,

  // exchanges
  validateExchangesConfigAndCreds,
};
