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
 * The HTTP Server Module that is instantiated on start up.
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
