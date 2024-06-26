import process from 'node:process';
import { Express } from 'express';
import { extractMessage } from 'error-message-utils';
import { ENVIRONMENT } from '../environment/environment.js';
import { delay } from '../modules/shared/utils/utils.js';
import { IServer, ITerminationSignal } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */
const serverFactory = async (app: Express): Promise<IServer> => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the instance of the HTTP Server
  const __instance = app.listen(ENVIRONMENT.serverPort);





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
    __instance.close((error: Error | undefined) => {
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
    // process.kill(process.pid, signal);
  };





  /* **********************************************************************************************
   *                                        SETUP HELPERS                                         *
   ********************************************************************************************** */

  const __setupModules = async (): Promise<void> => {
    console.log('1/10) Database Module: done\n');
    console.log('2/10) Auth Module: done\n');
  };

  const __setup = async (): Promise<void> => {
    // print the setup header
    console.log('\n\n\nBalancer API Setup\n\n');
    console.log('Initializing Modules:\n');

    // setup the modules
    await __setupModules();

    // print the setup footer
    console.log('\n\n\nBalancer API Running');
    console.log('Version: v1.0.0');
    console.log(`Port: ${ENVIRONMENT.serverPort}`);
    console.log(`Environment: ${ENVIRONMENT.environment}`);
    if (ENVIRONMENT.testMode) console.log('Test Mode: true');
    if (ENVIRONMENT.restoreMode) console.log('Restore Mode: true');
    // Notification.serverSetupCompleted(); @TODO
  };





  /* **********************************************************************************************
   *                                        SETUP PROCESS                                         *
   ********************************************************************************************** */

  /**
   * Ensure the proper environment and modes have been set prior to setting up the server.
   */
  if (ENVIRONMENT.environment === 'production' && ENVIRONMENT.testMode) {
    const msg = 'The server could not be setup because testMode cannot be enabled when running in a production environment.';
    console.error(msg);
    throw new Error(msg);
  }
  if (ENVIRONMENT.testMode && ENVIRONMENT.restoreMode) {
    const msg = 'The server could not be setup because testMode and restoreMode cannot be enabled simultaneously.';
    console.error(msg);
    throw new Error(msg);
  }

  /**
   * Attempts to setup the server so it can be consumed from external sources. When bootstraping the
   * server, many modules are initialized and it is possible for them to experience issues
   * that may be caused by temporary network interruptions. Therefore, the process is executed
   * persistently, allowing a small (incremental) delay before retrying.
   *
   * In case of failure, it will combine all the errors, display them and teardown the server.
   */
  const setupErrors: string[] = [];
  try {
    await __setup();
  } catch (e1) {
    setupErrors.push(extractMessage(e1));
    await __teardownModules();
    await delay(5);
    try {
      await __setup();
    } catch (e2) {
      setupErrors.push(extractMessage(e2));
      await __teardownModules();
      await delay(10);
      try {
        await __setup();
      } catch (e3) {
        setupErrors.push(extractMessage(e3));
        await __teardownModules();
        await delay(40);
        try {
          await __setup();
        } catch (e4) {
          setupErrors.push(extractMessage(e4));
          await __teardownModules();
          await delay(120);
          try {
            await __setup();
          } catch (e5) {
            setupErrors.push(extractMessage(e5));
            const msg = setupErrors.join(' | ');
            console.error(msg);
            // await Notification.serverSetupError(errorMessage); @TODO
            await __teardown();
            throw new Error(msg);
          }
        }
      }
    }
  }





  /* **********************************************************************************************
   *                                      INTERRUPT SIGNALS                                       *
   ********************************************************************************************** */

  /**
   * Subscribe to the interrupt signals and teardown the server if emitted.
   */
  process.once('SIGINT', __teardown);
  process.once('SIGTERM', __teardown);





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get instance() {
      return __instance;
    },

    // ...
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  serverFactory,
};
