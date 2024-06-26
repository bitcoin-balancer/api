/* eslint-disable no-console */
import process from 'node:process';
import { Express } from 'express';
import { extractMessage } from 'error-message-utils';
import { ENVIRONMENT } from '../environment/environment.js';
import { delay } from '../modules/shared/utils/utils.js';
import { IServer, ITerminationSignal } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Module in charge of managing the initialization and teardown of API modules as well as the
 * Node.js HTTP Server.
 * @param app
 * @returns Promise<IServer>
 */
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
   * IMPORTANT: when implementing this method in the modules, make sure to wrap the code inside of a
   * try...catch statement.
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
    // print the header
    console.log('\n\n\nBalancer API Teardown:');

    // log the termination signal (if any)
    if (typeof signal === 'string' && signal.length) console.log(`Signal: ${signal}`);

    // teardown all the modules
    await __teardownModules();
    console.log('1/2) Teardown Modules: done');

    // close the server
    await __closeServer();
    console.log('2/2) Close the HTTP Server: done');
  };





  /* **********************************************************************************************
   *                                    INITIALIZATION HELPERS                                    *
   ********************************************************************************************** */

  /**
   * Attempts to initialize all modules sequentially. Will throw if any of the modules fail to
   * initialize. This process is influenced by running mode (if any).
   * @returns Promise<void>
   */
  const __initializeModules = async (): Promise<void> => {
    console.log('1/10) Database Module: done');
    await delay(1);
    console.log('2/10) Auth Module: done');
    await delay(1);
    console.log('3/10) Notification Module: done');
    await delay(1);
    console.log('4/10) Market State Module: done');
  };

  /**
   * Handles the entire initialization process and notifies users once the process completes.
   * @returns Promise<void>
   */
  const __initialize = async (): Promise<void> => {
    // print the setup header
    console.log('\n\n\nBalancer API Initialization:');

    // setup the modules
    await __initializeModules();

    // enable
    // RequestGuard.serverInitialized = true; @TODO

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
   *                                    INITIALIZATION PROCESS                                    *
   ********************************************************************************************** */

  /**
   * Ensure the proper environment and modes have been set prior to setting up the server.
   */
  if (ENVIRONMENT.environment === 'production' && ENVIRONMENT.testMode) {
    throw new Error('The server could not be setup because testMode cannot be enabled when running in a production environment.');
  }
  if (ENVIRONMENT.testMode && ENVIRONMENT.restoreMode) {
    throw new Error('The server could not be setup because testMode and restoreMode cannot be enabled simultaneously.');
  }

  /**
   * Attempts to initialize the server so it can be consumed from external sources. When
   * bootstraping the server, many modules are initialized and it is possible for them to experience
   * issues that may be caused by temporary network interruptions. Therefore, the process is
   * executed persistently, allowing a small (incremental) delay before retrying.
   *
   * In case of failure, it will teardown the server and throw the last error.
   */
  try {
    await __initialize();
  } catch (e1) {
    console.log(extractMessage(e1));
    console.log('Retrying in ~5 seconds...');
    await __teardownModules();
    await delay(5);
    try {
      await __initialize();
    } catch (e2) {
      console.log(extractMessage(e2));
      console.log('Retrying in ~15 seconds...');
      await __teardownModules();
      await delay(15);
      try {
        await __initialize();
      } catch (e3) {
        console.log(extractMessage(e3));
        console.log('Retrying in ~45 seconds...');
        await __teardownModules();
        await delay(45);
        try {
          await __initialize();
        } catch (e4) {
          console.log(extractMessage(e4));
          console.log('Retrying in ~120 seconds...');
          await __teardownModules();
          await delay(120);
          try {
            await __initialize();
          } catch (e5) {
            const msg = extractMessage(e5);
            // await Notification.serverSetupError(msg); @TODO
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
