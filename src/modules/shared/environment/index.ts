import {
  getString,
  getInteger,
  getBoolean,
  getSecretString,
  getSecretObject,
  getObject,
} from './utils.js';
import {
  validateRootAccountConfig,
  validateTelegramConfig,
  validateJWTSecretConfig,
  validateExchangesConfigAndCreds,
} from './validations.js';
import {
  INodeEnv,
  IRootAccountConfig,
  ITelegramConfig,
  IJWTSecretConfig,
  IEnvironment,
  IExchangeConfig,
  IExchangeCredentials,
  IExchangesCredentials,
  IBaseAsset,
  IQuoteAsset,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

// populate the global object
const ENVIRONMENT: IEnvironment = {
  NODE_ENV: <INodeEnv>getString('NODE_ENV', ['development', 'production']),
  GUI_URL: getString('GUI_URL'),
  TEST_MODE: getBoolean('TEST_MODE'),
  RESTORE_MODE: getBoolean('RESTORE_MODE'),
  HAS_TUNNEL_TOKEN: getBoolean('HAS_TUNNEL_TOKEN'),
  API_PORT: getInteger('API_PORT'),
  POSTGRES_HOST: getString('POSTGRES_HOST'),
  POSTGRES_USER: getString('POSTGRES_USER'),
  POSTGRES_DB: getString('POSTGRES_DB'),
  POSTGRES_PORT: getInteger('POSTGRES_PORT'),
  POSTGRES_PASSWORD_FILE: getSecretString('POSTGRES_PASSWORD_FILE'),
  ROOT_ACCOUNT: <IRootAccountConfig>getSecretObject('ROOT_ACCOUNT'),
  TELEGRAM: <ITelegramConfig>getSecretObject('TELEGRAM'),
  ALTCHA_SECRET: getSecretString('ALTCHA_SECRET'),
  JWT_SECRET: <IJWTSecretConfig>getSecretObject('JWT_SECRET'),
  COOKIE_SECRET: getSecretString('COOKIE_SECRET'),
  EXCHANGE_CONFIGURATION: <IExchangeConfig>getObject('EXCHANGE_CONFIGURATION'),
  EXCHANGE_CREDENTIALS: <IExchangesCredentials>getSecretObject('EXCHANGE_CREDENTIALS'),
};

// validate objects & arrays
validateRootAccountConfig(ENVIRONMENT.ROOT_ACCOUNT);
validateTelegramConfig(ENVIRONMENT.TELEGRAM);
validateJWTSecretConfig(ENVIRONMENT.JWT_SECRET);
validateExchangesConfigAndCreds(
  ENVIRONMENT.EXCHANGE_CONFIGURATION,
  ENVIRONMENT.EXCHANGE_CREDENTIALS,
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // types
  type INodeEnv,
  type ITelegramConfig,
  type IExchangeConfig,
  type IExchangeCredentials,
  type IExchangesCredentials,
  type IBaseAsset,
  type IQuoteAsset,

  // implementation
  ENVIRONMENT,
};
