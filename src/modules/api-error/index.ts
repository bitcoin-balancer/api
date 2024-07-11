import { decodeError, extractMessage } from 'error-message-utils';
import { IObject } from '../shared/types.js';
import { IAPIErrorOrigin, IAPIErrorService } from './types.js';
import { buildArgs } from './utils.js';
import { deleteAllRecords, saveRecord } from './model.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * API Error Service Factory
 * Generates the object in charge of managing the storage and retrieval of errors thrown within the
 * API.
 * @returns IAPIErrorService
 */
const apiErrorServiceFactory = (): IAPIErrorService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the keys of values that are confidential and should not be stored or logged
  const __SENSITIVE_DATA_KEYS: string[] = ['password', 'newPassword'];

  // the list of errors that are regular and shouldn't be stored
  const __OMIT_ERROR_CODES: number[] = [
    // ...
  ];

  // the number of records that can be retrieved at a time
  const __LIST_LIMIT: number = 15;

  // the number of API Errors that have not been yet read by users
  let __unreadCount: number = 0;




  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */

  /**
   * Saves an API Error in the Database. This function can be invoked safely as it will never throw.
   * @param origin
   * @param error
   * @param uid?
   * @param ip?
   * @param args?
   * @returns Promise<void>
   */
  const save = async (
    origin: IAPIErrorOrigin,
    error: any,
    uid?: string,
    ip?: string,
    args?: IObject,
  ): Promise<void> => {
    try {
      // decode the error and check if it should be omitted
      const { code } = decodeError(error);
      if (!__OMIT_ERROR_CODES.includes(<number>code)) {
        // save the record and increment the unread count
        await saveRecord(
          origin,
          extractMessage(error),
          uid,
          ip,
          buildArgs(args, __SENSITIVE_DATA_KEYS),
        );
        __unreadCount += 1;
      }
    } catch (e) {
      console.error('APIErrorService.save(...)', e);
    }
  };

  /**
   * Deletes all the API Errors from the Database.
   * @returns Promise<void>
   */
  const deleteAll = async (): Promise<void> => {
    await deleteAllRecords();
    __unreadCount = 0;
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get unreadCount() {
      return __unreadCount;
    },

    // actions
    save,
    deleteAll,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const APIErrorService = apiErrorServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  APIErrorService,
};
