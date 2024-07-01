import process from 'node:process';
import { EnvironmentSchema, IEnvironment, INodeEnv } from './types.js';
import {
  getString,
  getInteger,
  getBoolean,
  getObject,
} from './environment.utils.js';

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
  POSTGRES_PASSWORD_FILE: getString('POSTGRES_PASSWORD_FILE'),
  ROOT_ACCOUNT: getObject('ROOT_ACCOUNT'),
  TELEGRAM: typeof process.env.TELEGRAM === 'string' && process.env.TELEGRAM.length
    ? getObject('TELEGRAM')
    : undefined,
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  ENVIRONMENT,
};
