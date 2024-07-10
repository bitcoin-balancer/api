import {
  stringValid,
  objectValid,
  uuidValid,
  nicknameValid,
  passwordValid,
  otpSecretValid,
} from '../validations/index.js';
import { IRootAccountConfig, ITelegramConfig, IJWTSecretConfig } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
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
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  validateRootAccountConfig,
  validateTelegramConfig,
  validateJWTSecretConfig,
};
