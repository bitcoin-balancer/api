import {
  stringValid,
  objectValid,
  uuidValid,
  nicknameValid,
  passwordValid,
  otpSecretValid,
} from '../validations/index.js';
import {
  IRootAccountConfig,
  ITelegramConfig,
  IJWTSecretConfig,
  IExchangeID,
  IExchangesCredentials,
  IExchangesConfig,
} from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

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
  if (!objectValid(config)) throw new Error(`The environment property ROOT_ACCOUNT is not a valid object. Received: ${JSON.stringify(config)}`);
  if (!uuidValid(config.uid)) throw new Error(`The environment property ROOT_ACCOUNT.uid is not a valid UUID. Received: ${config.uid}`);
  if (!nicknameValid(config.nickname)) throw new Error(`The environment property ROOT_ACCOUNT.nickname is not a valid nickname. Received: ${config.nickname}`);
  if (!passwordValid(config.password)) throw new Error(`The environment property ROOT_ACCOUNT.password is not a valid password. Received: ${config.password}`);
  if (!otpSecretValid(config.otpSecret)) throw new Error(`The environment property ROOT_ACCOUNT.otpSecret is not a valid secret. Received: ${config.otpSecret}`);
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
  if (!objectValid(config)) throw new Error(`The environment property TELEGRAM is not a valid object. Received: ${JSON.stringify(config)}`);
  if (typeof config.token !== 'string') throw new Error(`The environment property TELEGRAM.token is not a valid string. Received: ${config.token}`);
  if (typeof config.chatID !== 'number') throw new Error(`The environment property TELEGRAM.chatID is not a valid number. Received: ${config.chatID}`);
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
  if (!objectValid(config)) throw new Error(`The environment property JWT_SECRET is not a valid object. Received: ${JSON.stringify(config)}`);
  if (!stringValid(config.refresh, 1)) throw new Error(`The environment property JWT_SECRET.refresh is not a valid string. Received: ${config.refresh}`);
  if (!stringValid(config.access, 1)) throw new Error(`The environment property JWT_SECRET.access is not a valid string. Received: ${config.access}`);
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
  if (!stringValid(id, 1) || !EXCHANGE_IDS.includes(id)) {
    throw new Error(`The Exchange ID '${id}' (${module}) is not supported by Balancer.`);
  }
  if (
    !objectValid(credentials[id])
    || !stringValid(credentials[id].key, 1)
    || !stringValid(credentials[id].secret, 1)
  ) {
    throw new Error(`The credentials for the exchange '${id}' (${module}) are invalid or were not provided.`);
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
  config: IExchangesConfig,
  credentials: IExchangesCredentials,
): void => {
  if (!objectValid(config)) {
    throw new Error(`The environment property EXCHANGES_CONFIGURATION is not a valid object. Received: ${JSON.stringify(config)}`);
  }
  if (!objectValid(credentials)) {
    throw new Error('The environment property EXCHANGES_CREDENTIALS is not a valid object.');
  }
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
