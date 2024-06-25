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
 * Bootstrap
 * The API Bootstrap instance that is initialized on start up.
 */
type IBootstrap = {
  // properties
  server: Server<typeof IncomingMessage, typeof ServerResponse>,

  // setup
  // @TODO
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  ITerminationSignal,
  IBootstrap,
};
