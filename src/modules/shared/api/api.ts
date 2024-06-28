/* eslint-disable no-console */
import process from 'node:process';
import { Express } from 'express';
import { extractMessage } from 'error-message-utils';
import { ENVIRONMENT } from '../environment/environment.js';
import { delay } from '../utils/utils.js';
import { readPackageFile } from './api.utils.js';
import { canBeInitialized } from './api.validations.js';
import {
  IHTTPServer,
  ITerminationSignal,
  IPackageFile,
  IAPI,
} from './types.js';


/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * API
 * Module in charge of managing the initialization and teardown of API modules as well as the
 * Node.js HTTP Server.
 * @returns IServer
 */
const apiFactory = (): IAPI => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the instance of the HTTP Server
  let __server: IHTTPServer;

  // the current state of the initialization
  let __initialized: boolean = false;

  // the package file's contents
  let __packageFile: IPackageFile;





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
    __server.close((error: Error | undefined) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  /**
   * Kills the running modules and the server. This function is invoked when a termination signal
   * is emitted or the API fails to initialize.
   * @param signal?
   * @returns Promise<void>
   */
  const __teardown = async (signal?: ITerminationSignal): Promise<void> => {
    // print the header
    console.log('\n\n\nBalancer API Teardown:');

    // log the termination signal (if any)
    if (typeof signal === 'string' && signal.length) console.log(`Signal: ${signal}`);

    // set the initialization state in order to reject incoming requests
    __initialized = false;
    console.log('1/3) Reject Incoming Requests: done');

    // teardown all the modules
    await __teardownModules();
    console.log('2/3) Teardown Modules: done');

    // close the server
    await __closeServer();
    console.log('3/3) Close the HTTP Server: done');
  };





  /* **********************************************************************************************
   *                                        INITIALIZATION                                        *
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
    // throw new Error('Error when initializing the Notification module');
  };

  /**
   * Attempts to initialize the Node.js HTTP Server as well as the modules in sequential order based
   * on the running mode.
   * @returns Promise<void>
   */
  const __runInitialize = async (app: Express): Promise<void> => {
    // print the initialization header
    console.log('\n\n\nBalancer API Initialization:');

    // initialize the content of the package.json file if it hadn't been
    if (__packageFile === undefined) __packageFile = await readPackageFile();

    // initialize the HTTP Server if it hadn't been
    if (__server === undefined) __server = app.listen(ENVIRONMENT.serverPort);

    // setup the modules
    await __initializeModules();

    // set the initialization state in order to allow incoming requests
    __initialized = true;

    // print the setup footer
    console.log('\n\n\nBalancer API Running:');
    console.log(`Version: v${__packageFile.version}`);
    console.log(`Port: ${ENVIRONMENT.serverPort}`);
    console.log(`Environment: ${ENVIRONMENT.environment}`);
    if (ENVIRONMENT.testMode) console.log('Test Mode: true');
    if (ENVIRONMENT.restoreMode) console.log('Restore Mode: true');
    // Notification.serverSetupCompleted(); @TODO
  };

  /**
   * Attempts to initialize the server so it can be consumed from external sources. When
   * bootstraping the server, many modules are initialized and it is possible for them to experience
   * issues that may be caused by temporary network interruptions. Therefore, the process is
   * executed persistently, allowing a small (incremental) delay before retrying.
   *
   * In case of failure, it will teardown the server and throw the last error.
   * @param app
   * @returns Promise<void>
   * @throws
   * - If the environment is set to 'production' and the server is being initialized on 'testMode'
   * - If both, 'testMode' and 'restoreMode' are enabled
   * - If any of the modules or the HTTP Server cannot be initialized
   */
  const initialize = async (
    app: Express,
    retryDelaySchedule: number[] = [5, 15, 45, 120],
  ): Promise<void> => {
    // validate the request
    canBeInitialized();

    // attempt to initialize the server
    try {
      return await __runInitialize(app);
    } catch (e) {
      const msg = extractMessage(e);
      console.error(msg);

      // throw an error if there no attempts left. Otherwise, try again
      if (retryDelaySchedule.length === 0) {
        // await Notification.serverSetupError(msg); @TODO
        await __teardown();
        throw new Error(msg);
      }
      console.log(`Retrying in ~${retryDelaySchedule[0]} seconds...`);
      await __teardownModules();
      await delay(retryDelaySchedule[0]);
      return initialize(app, retryDelaySchedule.slice(1));
    }
  };





  /* **********************************************************************************************
   *                                      INTERRUPT SIGNALS                                       *
   ********************************************************************************************** */

  /**
   * Subscribes to the interrupt signals and triggers a teardown if emitted.
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
    get initialized() {
      return __initialized;
    },
    get packageFile() {
      return __packageFile;
    },

    // initialization
    initialize,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const API = apiFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  API,
};
