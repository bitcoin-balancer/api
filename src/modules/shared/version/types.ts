

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Service Version
 * The information regarding the current version of a service (gui | api).
 */
type IServiceVersion = {
  // the version extracted from the package.json file
  version: string;

  // the commit's SHA-1 hash
  sha: string;

  // the timestamp in ms when the commit was deployed
  event_time: number;
};

/**
 * Version
 * The versions for the services that comprise Balancer.
 */
type IVersion = {
  // the latest distributed version of the GUI
  gui: IServiceVersion;

  // the latest distributed version of the API
  api: IServiceVersion;

  // the version of the API that's currently running
  apiRunning: string;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  IServiceVersion,
  IVersion,
};
