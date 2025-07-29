import { Express } from 'express';
import { IHTTPServer, IPackageFile } from '../types.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * API Service
 * This object is instantiated on start up and is in charge of managing the initialization and
 * teardown of API modules as well as the Node.js HTTP Server.
 */
type IAPIService = {
  // properties
  server: IHTTPServer;
  initialized: boolean;
  packageFile: IPackageFile;

  // initialization
  initialize: (app: Express, retryDelaySchedule?: number[]) => Promise<void>;
};

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

// ...

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IAPIService,

  // types
  // ...
};
