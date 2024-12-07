/* eslint-disable no-console */
import process from 'node:process';
import { Express } from 'express';
import { extractMessage } from 'error-message-utils';
import { delay } from 'web-utils-kit';
import { ENVIRONMENT } from '../environment/index.js';
import { IPackageFile, IHTTPServer, ITerminationSignal } from '../types.js';
import { SocketIOService } from '../socket-io/index.js';
import { DatabaseService } from '../../database/index.js';
import { NotificationService } from '../../notification/index.js';
import { UserService } from '../../auth/user/index.js';
import { JWTService } from '../../auth/jwt/index.js';
import { IPBlacklistService } from '../../ip-blacklist/index.js';
import { VersionService } from '../version/index.js';
import { ServerService } from '../../server/index.js';
import { MarketStateService } from '../../market-state/index.js';
import { PositionService } from '../../position/index.js';
import { DataJoinService } from '../../data-join/index.js';
import {
  readPackageFile,
  printInitializationHeader,
  printInitializationFooter,
  printTeardownHeader,
} from './utils.js';
import { canBeInitialized } from './validations.js';
import { IAPIService } from './types.js';

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
      // Socket IO Module
      try {
        await SocketIOService.teardown();
      } catch (e) {
        console.error('SocketIOService.teardown()', e);
      }

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

      // Version Module
      try {
        await VersionService.teardown();
      } catch (e) {
        console.error('VersionService.teardown()', e);
      }

      // Server Module
      try {
        await ServerService.teardown();
      } catch (e) {
        console.error('ServerService.teardown()', e);
      }

      // Market State Module
      try {
        await MarketStateService.teardown();
      } catch (e) {
        console.error('MarketStateService.teardown()', e);
      }

      // Position Module
      try {
        await PositionService.teardown();
      } catch (e) {
        console.error('PositionService.teardown()', e);
      }

      // Data Join Module
      try {
        await DataJoinService.teardown();
      } catch (e) {
        console.error('DataJoinService.teardown()', e);
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
    if (__server.listening) {
      await __closeServer();
    }
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
      // Socket IO Module
      console.log('1/11) Socket IO Module: started');
      try {
        await SocketIOService.initialize(__server);
      } catch (e) {
        throw new Error(`SocketIOService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('1/11) Socket IO Module: done');

      // Database Module
      console.log('2/11) Database Module: started');
      try {
        await DatabaseService.initialize();
      } catch (e) {
        throw new Error(`DatabaseService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('2/11) Database Module: done');

      // Notification Module
      console.log('3/11) Notification Module: started');
      try {
        await NotificationService.initialize();
      } catch (e) {
        throw new Error(`NotificationService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('3/11) Notification Module: done');

      // User Module
      console.log('4/11) User Module: started');
      try {
        await UserService.initialize();
      } catch (e) {
        throw new Error(`UserService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('4/11) User Module: done');

      // JWT Module
      console.log('5/11) JWT Module: started');
      try {
        await JWTService.initialize();
      } catch (e) {
        throw new Error(`JWTService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('5/11) JWT Module: done');

      // IP Blacklist Module
      console.log('6/11) IP Blacklist Module: started');
      try {
        await IPBlacklistService.initialize();
      } catch (e) {
        throw new Error(`IPBlacklistService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('6/11) IP Blacklist Module: done');

      // Version Module
      console.log('7/11) Version Module: started');
      try {
        await VersionService.initialize(__packageFile.version);
      } catch (e) {
        throw new Error(`VersionService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('7/11) Version Module: done');

      // Server Module
      console.log('8/11) Server Module: started');
      try {
        await ServerService.initialize(__packageFile.version);
      } catch (e) {
        throw new Error(`ServerService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('8/11) Server Module: done');

      // Market State Module
      console.log('9/11) Market State Module: started');
      try {
        await MarketStateService.initialize();
      } catch (e) {
        throw new Error(`MarketStateService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('9/11) Market State Module: done');

      // Position Module
      console.log('10/11) Position Module: started');
      try {
        await PositionService.initialize();
      } catch (e) {
        throw new Error(`PositionService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('10/11) Position Module: done');

      // Data Join Module
      console.log('11/11) Data Join Module: started');
      try {
        await DataJoinService.initialize();
      } catch (e) {
        throw new Error(`DataJoinService.initialize() -> ${extractMessage(e)}`);
      }
      console.log('11/11) Data Join Module: done');
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
