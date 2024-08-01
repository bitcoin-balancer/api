import { extractMessage } from 'error-message-utils';
import { sendPOST } from 'fetch-request-node';
import { ENVIRONMENT, ITelegramConfig } from '../environment/index.js';
import { delay } from '../utils/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { IVersionService, IVersion } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Version Service Factory
 * Generates the Object in charge of keeping track of the running and latest distributed versions.
 * @returns IVersionService
 */
const versionServiceFactory = (): IVersionService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the main object version that will be kept in sync with GitHub
  let __version: IVersion;

  // the latest versions will be re-fetched every __refreshFrequency hours
  const __REFRESH_FREQUENCY: number = 6;
  let __refreshInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  const __getServiceVersion = async (url: string): Promise<string> => {

  };





  /* **********************************************************************************************
   *                                          INITIALIZER                                         *
   ********************************************************************************************** */

  /**
   * Initializes the Notification Module if the configuration was provided.
   * @param runningVersion
   * @returns Promise<void>
   */
  const initialize = async (runningVersion: string): Promise<void> => {
    // initialize the interval
    __refreshInterval = setInterval(async () => {
      // ...
    }, (__REFRESH_FREQUENCY * (60 * 60)) * 1000);
  };

  /**
   * Tears down the Version Module if it was initialized.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    if (__refreshInterval) {
      clearInterval(__refreshInterval);
    }
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get version() {
      return __version;
    },

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const VersionService = versionServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  VersionService,

  // types
  type IVersion,
};
