

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Environment Name
 * The name of the kinds of environments that can be used when running Node.js processes.
 */
type IEnvironmentName = 'development' | 'production';

/**
 * Environment
 * The object that contains all the environment variables required by the API.
 */
type IEnvironment = {
  // the kind of environment the API was started with
  environment: IEnvironmentName;

  // if enabled, the server will be setup with the sole purpose of running unit & integration tests
  testMode: boolean,

  // if enabled, the server will be setup with the sole purpose of restoring the database
  restoreMode: boolean,

  // the port that will be exposed publicly by the server
  serverPort: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  IEnvironmentName,
  IEnvironment,
};
