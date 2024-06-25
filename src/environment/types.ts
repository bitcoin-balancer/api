

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

  // the port that will be exposed by the server
  port: number;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  IEnvironmentName,
  IEnvironment,
};
