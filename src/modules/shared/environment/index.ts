import { EnvironmentSchema, IEnvironment, INodeEnv } from './types.js';
import {
  getString,
  getInteger,
  getBoolean,
  getSecretString,
  getSecretObject,
} from './utils.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */
const ENVIRONMENT = EnvironmentSchema.parse(<IEnvironment>{
  NODE_ENV: <INodeEnv>getString('NODE_ENV', ['development', 'production']),
  TEST_MODE: getBoolean('TEST_MODE'),
  RESTORE_MODE: getBoolean('RESTORE_MODE'),
  API_PORT: getInteger('API_PORT'),
  POSTGRES_HOST: getString('POSTGRES_HOST'),
  POSTGRES_USER: getString('POSTGRES_USER'),
  POSTGRES_DB: getString('POSTGRES_DB'),
  POSTGRES_PORT: getInteger('POSTGRES_PORT'),
  POSTGRES_PASSWORD_FILE: getSecretString('POSTGRES_PASSWORD_FILE'),
  ROOT_ACCOUNT: getSecretObject('ROOT_ACCOUNT'),
  TELEGRAM: getSecretObject('TELEGRAM'),
  ALTCHA_SECRET: getSecretString('ALTCHA_SECRET'),
  JWT_SECRET: getSecretObject('JWT_SECRET'),
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // types
  // ...

  // implementation
  ENVIRONMENT,
};
