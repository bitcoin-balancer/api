import { IUser } from '../auth/user/index.js';
import { IVersion } from '../shared/version/index.js';
import { IMarketState } from '../market-state/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Data Join Service
 * Object in charge of combining multiple data sources into one in order to reduce the number of
 * requests.
 */
type IDataJoinService = {
  // properties
  // ...

  // retrievers
  getAppEssentials: (uid: string) => IAppEssentials;

  // initializer
  initialize: () => Promise<void>;
  teardown: () => Promise<void>;
};





/* ************************************************************************************************
 *                                         APP ESSENTIALS                                         *
 ************************************************************************************************ */

/**
 * App Essentials
 * The object that contains the essential data so the user can make use of the app.
 */
type IAppEssentials = {
  // the server's current time in ms
  serverTime: number;

  // the current version of the platform
  version: IVersion;

  // the number of unread notifications
  unreadNotifications: number;

  // the number of unread errors
  unreadAPIErrors: number;

  // the object of the user who is currently logged in
  user: IUser;

  // the current state of the market
  marketState: IMarketState;

  // the active position record (if any)
  // ...
};

/**
 * Compact App Essentials
 * The compact version of the App Essentials which is broadcasted through websockets.
 */
type ICompactAppEssentials = {
  // the number of unread notifications
  unreadNotifications: number;

  // the number of unread errors
  unreadAPIErrors: number;

  // the current state of the market
  marketState: IMarketState;

  // the active position record (if any)
  // ...
};




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IDataJoinService,

  // app essentials
  IAppEssentials,
  ICompactAppEssentials,
};
