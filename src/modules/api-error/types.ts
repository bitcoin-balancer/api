import { IRecord } from '../shared/types.js';

/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * API Error Service
 * Object in charge of managing the storage and retrieval of errors thrown within the API.
 */
type IAPIErrorService = {
  // properties
  unreadCount: number;

  // actions
  save: (
    origin: IAPIErrorOrigin,
    error: any,
    uid?: string,
    ip?: string,
    args?: IRecord,
  ) => Promise<void>;
  list: (startAtID: number | undefined) => Promise<IAPIError[]>;
  deleteAll: () => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * API Error Origin
 * The invocation that triggered the error. It can be a specific function or a route.
 */
type IAPIErrorOrigin = 'AutomatedTest' | 'Notification.broadcast';

/**
 * API Error
 * The recordof the error that is stored in the database.
 */
type IAPIError = {
  // the autoincrementing integer used to identify a record
  id: number;

  // the origin of the error
  origin: IAPIErrorOrigin;

  // the error message (encoded in case it was generated w/ error-message-utils)
  error: string;

  // the timestamp when the error was thrown
  event_time: number;

  // the identifier of the user who sent the request
  uid: string | null;

  // the ip address of the user who sent the request
  ip: string | null;

  // the arguments used when the error was thrown
  args: IRecord | null;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IAPIErrorService,

  // types
  IAPIErrorOrigin,
  IAPIError,
};
