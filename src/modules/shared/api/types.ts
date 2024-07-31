import { Server, IncomingMessage, ServerResponse } from 'http';
import { Express } from 'express';
import { IPackageFile } from '../types.js';

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
  initialized: boolean,
  packageFile: IPackageFile,

  // initialization
  initialize: (app: Express, retryDelaySchedule?: number[]) => Promise<void>,
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * HTTP Server
 * The instanec of a Node.js HTTP Server.
 */
type IHTTPServer = Server<typeof IncomingMessage, typeof ServerResponse>;

/**
 * Termination Signal
 * The signal that is emitted once the process is being shutdown.
 */
type ITerminationSignal = 'SIGINT' | 'SIGTERM';





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IAPIService,

  // types
  IHTTPServer,
  ITerminationSignal,
};
