import { IEnvironment, IEnvironmentName } from './types.js';
import { getString, getInteger } from './environment.utils.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */
const ENVIRONMENT: IEnvironment = {
  environment: <IEnvironmentName>getString('NODE_ENV', ['development', 'production']),
  port: getInteger('apiPort'),
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  ENVIRONMENT,
};
