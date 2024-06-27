import { Server, IncomingMessage, ServerResponse } from 'http';
import { Express } from 'express';

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

/**
 * API
 * The API Module that is instantiated on start up and is in charge of managing the
 * initialization and teardown of API modules as well as the Node.js HTTP Server.
 */
type IAPI = {
  // properties
  server: IHTTPServer;
  initialized: boolean,
  version: string,

  // initialization
  initialize: (app: Express, retryDelaySchedule?: number[]) => Promise<void>,
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  IHTTPServer,
  ITerminationSignal,
  IAPI,
};
