import { IUser } from '../auth/user/index.js';
import { IVersion } from '../shared/version/index.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */



/**
 * Data Join Server
 * Object in charge of combining multiple data sources into one in order to reduce the number of
 * requests.
 */
type IDataJoinService = {
  // properties
  // ...

  // retrievers
  // ...
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

  // the number of unread errors
  unreadAPIErrors: number;

  // the object of the user who is currently logged in
  user: IUser;

  // the current state of the market
  // ...

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
};
