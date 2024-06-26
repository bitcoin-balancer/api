import { Server, IncomingMessage, ServerResponse } from 'http';

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Termination Signal
 * The signal that is emitted once the process is being shutdown.
 */
type ITerminationSignal = 'SIGINT' | 'SIGTERM';

/**
 * Server
 * The Server Module that is instantiated on start up and is in charge of managing the API's
 * setup and teardown of modules as well as the Node.js HTTP Server.
 */
type IServer = {
  // properties
  instance: Server<typeof IncomingMessage, typeof ServerResponse>,

  // ...
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  ITerminationSignal,
  IServer,
};
