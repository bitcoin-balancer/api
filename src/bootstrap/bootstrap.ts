import process from 'node:process';
import { Express } from 'express';
import { ENVIRONMENT } from '../environment/environment.js';
import { ITerminationSignal } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */
const bootstrapFactory = (app: Express) => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the instance of the HTTP Server
  const __server = app.listen(ENVIRONMENT.port);





  /* **********************************************************************************************
   *                                           TEARDOWN                                           *
   ********************************************************************************************** */

  /**
   * Calls the teardown method for all the modules that are initialized on setup.
   * @returns Promise<void>
   */
  const __teardownModules = async (): Promise<void> => {
    // @TODO
  };

  /**
   * Closes the connection to the HTTP Server.
   * @returns Promise<void>
   */
  const __closeServer = (): Promise<void> => new Promise((resolve, reject) => {
    __server.close((error: Error | undefined) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  /**
   * Kills the running modules, the server and the process itself. This function is invoked when
   * a termination signal is emitted or the API fails to setup.
   * @param signal?
   * @returns Promise<void>
   */
  const __teardown = async (signal?: ITerminationSignal): Promise<void> => {
    // log the termination signal (if any)
    if (typeof signal === 'string' && signal.length) console.log(`Received signal to terminate: ${signal}`);

    // teardown all the modules
    await __teardownModules();

    // close the server
    await __closeServer();

    // finally, kill the process
    process.kill(process.pid, signal);
  };

  /**
   * Subscribe to the interrupt signals and teardown the API if emitted.
   */
  process.once('SIGINT', __teardown);
  process.once('SIGTERM', __teardown);





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get server() {
      return __server;
    },

    // setup

  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  bootstrapFactory,
};
