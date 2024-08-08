import { APIErrorService } from '../api-error/index.js';
import { UserService } from '../auth/user/index.js';
import { VersionService } from '../shared/version/index.js';
import { IDataJoinService, IAppEssentials, ICompactAppEssentials } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Data Join Service Factory
 * Generates the object in charge of combining multiple data sources into one in order to reduce the
 * number of requests.
 * @returns IDataJoinService
 */
const dataJoinServiceFactory = (): IDataJoinService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // ...





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves the App Essentials for a given user.
   * @param uid
   * @returns IAppEssentials
   */
  const getAppEssentials = (uid: string): IAppEssentials => ({
    serverTime: Date.now(),
    version: VersionService.version,
    unreadAPIErrors: APIErrorService.unreadCount,
    user: UserService.getUser(uid),
    // ...
  });





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Data Join Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // ...
  };

  /**
   * Tears down the Data Join Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    // ...
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // retrievers
    getAppEssentials,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const DataJoinService = dataJoinServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  DataJoinService,

  // types
  type ICompactAppEssentials,
};
