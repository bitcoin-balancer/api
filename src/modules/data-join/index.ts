import { APIErrorService } from '../api-error/index.js';
import { NotificationService } from '../notification/index.js';
import { UserService } from '../auth/user/index.js';
import { VersionService } from '../shared/version/index.js';
import { SocketIOService } from '../shared/socket-io/index.js';
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

  // the compact app essentials will be emitted every __emitFrequency seconds
  const __emitFrequency: number = 5;
  let __emitInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Builds the App Essentials for a given user.
   * @param uid
   * @returns IAppEssentials
   */
  const getAppEssentials = (uid: string): IAppEssentials => ({
    serverTime: Date.now(),
    version: VersionService.version,
    unreadNotifications: NotificationService.unreadCount,
    unreadAPIErrors: APIErrorService.unreadCount,
    user: UserService.getUser(uid),
    // ...
  });

  /**
   * Builds the Compact App Essentials ready to emitted.
   * @returns ICompactAppEssentials
   */
  const __getCompactAppEssentials = (): ICompactAppEssentials => ({
    unreadNotifications: NotificationService.unreadCount,
    unreadAPIErrors: APIErrorService.unreadCount,
  });





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Data Join Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    __emitInterval = setInterval(() => {
      try {
        SocketIOService.emitCompactAppEssentials(__getCompactAppEssentials());
      } catch (e) {
        APIErrorService.save('DataJoinService.initialize.emitCompactAppEssentials', e);
      }
    }, __emitFrequency * 1000);
  };

  /**
   * Tears down the Data Join Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    clearInterval(__emitInterval);
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
