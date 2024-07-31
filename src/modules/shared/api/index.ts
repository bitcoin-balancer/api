/* eslint-disable no-console */
import process from 'node:process';
import { Express } from 'express';
import { extractMessage } from 'error-message-utils';
import { ENVIRONMENT } from '../environment/index.js';
import { IPackageFile } from '../types.js';
import { delay } from '../utils/index.js';
import { DatabaseService } from '../../database/index.js';
import { NotificationService } from '../notification/index.js';
import { UserService } from '../../auth/user/index.js';
import { JWTService } from '../../auth/jwt/index.js';
import { IPBlacklistService } from '../../ip-blacklist/index.js';
import {
  IHTTPServer,
  ITerminationSignal,
  IAPIService,
} from './types.js';
import {
  readPackageFile,
  printInitializationHeader,
  printInitializationFooter,
  printTeardownHeader,
} from './utils.js';
import { canBeInitialized } from './validations.js';


/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * API Service Factory
 * Generates the object in charge of managing the initialization and teardown of API modules as well
 * as the Node.js HTTP Server.
 * @returns IAPIService
 */
const apiServiceFactory = (): IAPIService => {
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
   * Keep in mind the modules are only initialized if TEST_MODE is disabled as the automated tests
   * initialize and teardown the modules it needs in the vitest-setup.ts file.
   * @returns Promise<void>
   */
  const __teardownModules = async (): Promise<void> => {
    if (!ENVIRONMENT.TEST_MODE) {
      // Notification Module
      try {
        await NotificationService.teardown();
      } catch (e) {
        console.error('NotificationService.teardown()', e);
      }

      // User Module
      try {
        await UserService.teardown();
      } catch (e) {
        console.error('UserService.teardown()', e);
      }

      // JWT Module
      try {
        await JWTService.teardown();
      } catch (e) {
        console.error('JWTService.teardown()', e);
      }

      // IP Blacklist Module
      try {
        await IPBlacklistService.teardown();
      } catch (e) {
        console.error('IPBlacklistService.teardown()', e);
      }

      // Database Module
      // must be last so the pool remains active until all modules have been teared down
      try {
        await DatabaseService.teardown();
      } catch (e) {
        console.error('DatabaseService.teardown()', e);
      }
    }
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
    printTeardownHeader(signal);

    // set the initialization state in order to reject incoming requests
    __initialized = false;
    console.log('1/3) Reject Incoming Requests: started');
    console.log('1/3) Reject Incoming Requests: done\n');

    // teardown all the modules
    console.log('2/3) Teardown Modules: started');
    await __teardownModules();
    console.log('2/3) Teardown Modules: done\n');

    // close the server
    console.log('3/3) Close the HTTP Server: started');
    await __closeServer();
    console.log('3/3) Close the HTTP Server: done');
  };





  /* **********************************************************************************************
   *                                        INITIALIZATION                                        *
   ********************************************************************************************** */

  /**
   * Attempts to initialize all modules sequentially. Will throw if any of the modules fail to
   * initialize.
   * Keep in mind the modules are only initialized if TEST_MODE is disabled as the automated tests
   * initialize the modules it needs in the vitest-setup.ts file.
   * @returns Promise<void>
   */
  const __initializeModules = async (): Promise<void> => {
    if (!ENVIRONMENT.TEST_MODE) {
      // Database Module
      console.log('1/10) Database Module: started');
      try {
        await DatabaseService.initialize();
      } catch (e) {
        throw new Error(`DatabaseService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('1/10) Database Module: done');

      // Notification Module
      console.log('2/10) Notification Module: started');
      try {
        await NotificationService.initialize();
      } catch (e) {
        throw new Error(`NotificationService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('2/10) Notification Module: done');

      // User Module
      console.log('3/10) User Module: started');
      try {
        await UserService.initialize();
      } catch (e) {
        throw new Error(`UserService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('3/10) User Module: done');

      // JWT Module
      console.log('4/10) JWT Module: started');
      try {
        await JWTService.initialize();
      } catch (e) {
        throw new Error(`JWTService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('4/10) JWT Module: done');

      // IP Blacklist Module
      console.log('5/10) IP Blacklist Module: started');
      try {
        await IPBlacklistService.initialize();
      } catch (e) {
        throw new Error(`IPBlacklistService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('5/10) IP Blacklist Module: done');
    }
  };

  /**
   * Attempts to initialize the Node.js HTTP Server as well as the modules in sequential order based
   * on the running mode.
   * @returns Promise<void>
   */
  const __runInitialize = async (app: Express): Promise<void> => {
    // print the initialization header
    printInitializationHeader(__server !== undefined);

    // initialize the content of the package.json file if it hadn't been
    console.log('Read Package File: started');
    if (__packageFile === undefined) __packageFile = readPackageFile();
    console.log('Read Package File: done\n');

    // initialize the HTTP Server if it hadn't been
    console.log('Initialize HTTP Server: started');
    if (__server === undefined) __server = app.listen(ENVIRONMENT.API_PORT);
    console.log('Initialize HTTP Server: done\n');

    // setup the modules
    console.log('Initialize Modules: started');
    await __initializeModules();
    console.log('Initialize Modules: done');

    // set the initialization state in order to allow incoming requests
    __initialized = true;

    // print the initialization footer
    printInitializationFooter(__packageFile.version);
    NotificationService.apiInit();
  };

  /**
   * Attempts to initialize the server so it can be consumed from external sources. When
   * bootstraping the server, many modules are initialized and it is possible for them to experience
   * issues that may be caused by temporary network interruptions. Therefore, the process is
   * executed persistently, allowing a small (incremental) delay before retrying.
   *
   * In case of failure, it will teardown the server and throw the last error.
   * @param app
   * @param retryDelaySchedule?
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
      console.error('APIService.initialize(...)', e);

      // throw an error if there are no attempts left. Otherwise, try again
      if (retryDelaySchedule.length === 0) {
        await NotificationService.apiInitError(e);
        await __teardown();
        throw e;
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
const APIService = apiServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  APIService,
};
