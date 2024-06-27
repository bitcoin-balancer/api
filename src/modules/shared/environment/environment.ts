import { IEnvironment, IEnvironmentName } from './types.js';
import { getString, getInteger, getBoolean } from './environment.utils.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */
const ENVIRONMENT: IEnvironment = {
  environment: <IEnvironmentName>getString('NODE_ENV', ['development', 'production']),
  testMode: getBoolean('testMode'),
  restoreMode: getBoolean('restoreMode'),
  serverPort: getInteger('serverPort'),
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  ENVIRONMENT,
};
