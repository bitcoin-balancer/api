import { Subscription } from 'rxjs';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { APIErrorService } from '../api-error/index.js';
import { NotificationService } from '../notification/index.js';
import { UserService } from '../auth/user/index.js';
import { VersionService } from '../shared/version/index.js';
import { SocketIOService } from '../shared/socket-io/index.js';
import { MarketStateService, IMarketState } from '../market-state/index.js';
import { IDataJoinService, IAppEssentials, ICompactAppEssentials } from './types.js';
import { sliceWindow } from './utils.js';

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

  // the market state object
  let __marketState: IMarketState;
  let __marketStateSub: Subscription;





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
    exchangeConfig: ENVIRONMENT.EXCHANGE_CONFIGURATION,
    marketState: __marketState,
    // ...
  });

  /**
   * Builds the Compact App Essentials ready to emitted.
   * @returns ICompactAppEssentials
   */
  const __getCompactAppEssentials = (): ICompactAppEssentials => ({
    unreadNotifications: NotificationService.unreadCount,
    unreadAPIErrors: APIErrorService.unreadCount,
    marketState: {
      ...__marketState,
      windowState: {
        ...__marketState.windowState,
        window: sliceWindow(__marketState.windowState.window),
      },
    },
  });





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Fires whenever there is a new market state object.
   * @param marketState
   */
  const __onMarketStateChanges = (marketState: IMarketState): void => {
    try {
      __marketState = marketState;
      SocketIOService.emitCompactAppEssentials(__getCompactAppEssentials());
    } catch (e) {
      APIErrorService.save('DataJoinService.initialize.emitCompactAppEssentials', e);
    }
  };

  /**
   * Initializes the Data Join Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // subscribe to the market state
    __marketStateSub = MarketStateService.subscribe(__onMarketStateChanges);

    // ...
  };

  /**
   * Tears down the Data Join Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    if (__marketStateSub) {
      __marketStateSub.unsubscribe();
    }
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
