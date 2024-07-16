/* eslint-disable no-console */
import { decodeError, extractMessage } from 'error-message-utils';
import { IRecord } from '../shared/types.js';
import { IAPIError, IAPIErrorOrigin, IAPIErrorService } from './types.js';
import { buildArgs } from './utils.js';
import { canRecordsBeListed } from './validations.js';
import { deleteAllRecords, listRecords, saveRecord } from './model.js';
import { ENVIRONMENT } from '../shared/environment/index.js';

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
  const __SENSITIVE_DATA_KEYS: string[] = [
    'password',
    'newPassword',
  ];

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
   * Saves an API Error in the Database if it is not in the omit list. This function can be invoked
   * safely as it will never throw.
   * @param origin
   * @param error
   * @param uid?
   * @param ip?
   * @param args?
   * @param printError?
   * @returns Promise<void>
   */
  const save = async (
    origin: IAPIErrorOrigin,
    error: any,
    uid?: string,
    ip?: string,
    args?: IRecord<any>,
    printError: boolean = true,
  ): Promise<void> => {
    try {
      if (!ENVIRONMENT.TEST_MODE && printError) console.error(error);
      const { code } = decodeError(error);
      if (!__OMIT_ERROR_CODES.includes(<number>code)) {
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
   * Retrieves a series of API Errors. If the startAtID is provided, it will start at that point
   * exclusively.
   * @param startAtID
   * @returns Promise<IAPIError[]>
   */
  const list = async (startAtID: number | undefined): Promise<IAPIError[]> => {
    canRecordsBeListed(startAtID);
    const records = await listRecords(__LIST_LIMIT, startAtID);
    __unreadCount = 0;
    return records;
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
    list,
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
