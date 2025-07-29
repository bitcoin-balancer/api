import { encodeError } from 'error-message-utils';
import { IIPBlacklistRecord, IIPBlacklistService } from './types.js';
import { sanitizeIP, sanitizeRecordData } from './utils.js';
import {
  canBlacklistBeListed,
  canIPBeRegistered,
  canIPBeUnregistered,
  canIPRegistrationBeUpdated,
} from './validations.js';
import {
  getRecord,
  listIPs,
  createRecord,
  updateRecord,
  deleteRecord,
  listRecords,
} from './model.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * IP Blacklist Service Factory
 * Generates the object in charge of keeping track of potentially malicious IP Addresses.
 * @returns ISomeService
 */
const ipBlacklistServiceFactory = (): IIPBlacklistService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the object containing all blacklisted IP Addresses
  let __blacklist: { [ip: string]: boolean } = {};

  /* **********************************************************************************************
   *                                           IP STATUS                                          *
   ********************************************************************************************** */

  /**
   * Verifies if an IP Address is currently blacklisted.
   * @param ip
   * @throws
   * - 5000: if the IP Address is in the blacklist
   */
  const isBlacklisted = (ip: string): void => {
    const sip = sanitizeIP(ip);
    if (__blacklist[sip]) {
      throw new Error(
        encodeError(`The ip '${sip}' is blacklisted and should not be served.`, 5000),
      );
    }
  };

  /* **********************************************************************************************
   *                                           RETRIEVERS                                         *
   ********************************************************************************************** */

  /**
   * Retrieves a list of IP Blacklist Records from the database. A custom starting point can be
   * provided in order to paginate through the records.
   * @param limit
   * @param startAtID
   * @returns Promise<IIPBlacklistRecord[]>
   * @throws
   * - 5255: if the starting point is provided and is invalid
   * - 5256: if the query limit is larger than the limit
   */
  const list = (limit: number, startAtID: number | undefined): Promise<IIPBlacklistRecord[]> => {
    canBlacklistBeListed(limit, startAtID);
    return listRecords(limit, startAtID);
  };

  /* **********************************************************************************************
   *                                        RECORD MANAGEMENT                                     *
   ********************************************************************************************** */

  /**
   * Registers an IP Address in the Blacklist. Once registered, the API won't serve future requests
   * sent by the IP.
   * @param ip
   * @param notes
   * @returns Promise<IIPBlacklistRecord>
   * @throws
   * - 5250: if the IP has an invalid format
   * - 5251: if the notes have been provided but are invalid
   * - 5252: if the IP Address has already been registered
   */
  const registerIP = async (ip: string, notes: string | undefined): Promise<IIPBlacklistRecord> => {
    // init values
    const { sanitizedIP, sanitizedNotes } = sanitizeRecordData(ip, notes);
    const eventTime = Date.now();

    // validate the request
    await canIPBeRegistered(sanitizedIP, sanitizedNotes);

    // register the record and return it
    const id = await createRecord(sanitizedIP, sanitizedNotes, eventTime);
    __blacklist[sanitizedIP] = true;
    return {
      id,
      ip: sanitizedIP,
      notes: sanitizedNotes,
      event_time: eventTime,
    };
  };

  /**
   * Updates an IP Blacklist Registration Record.
   * @param id
   * @param ip
   * @param notes
   * @returns Promise<void>
   * @throws
   * - 5250: if the IP has an invalid format
   * - 5251: if the notes have been provided but are invalid
   * - 5252: if the identifier has an invalid format
   * - 5253: if the IP has already been blacklisted by a different record
   */
  const updateIPRegistration = async (
    id: number,
    ip: string,
    notes: string | undefined,
  ): Promise<void> => {
    // init values
    const { sanitizedIP, sanitizedNotes } = sanitizeRecordData(ip, notes);

    // validate the request
    await canIPRegistrationBeUpdated(id, sanitizedIP, sanitizedNotes);

    // update the record
    await updateRecord(id, sanitizedIP, sanitizedNotes);
    delete __blacklist[ip];
    __blacklist[sanitizedIP] = true;
  };

  /**
   * Unregisters an IP Address from the Blacklist.
   * @param id
   * @returns Promise<void>
   * @throws
   * - 5254: if the registration cannot be found in the database
   */
  const unregisterIP = async (id: number): Promise<void> => {
    // retrieve the record (if any)
    const record = await getRecord(id);

    // validate the request
    canIPBeUnregistered(id, record);

    // delete the record
    await deleteRecord(id);
    delete __blacklist[record!.ip];
  };

  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the IP Blacklist Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    __blacklist = (await listIPs()).reduce(
      (previous, current) => ({
        ...previous,
        [current]: true,
      }),
      {},
    );
  };

  /**
   * Tears down the IP Blacklist Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    __blacklist = {};
  };

  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // ip status
    isBlacklisted,

    // retrievers
    list,

    // record management
    registerIP,
    updateIPRegistration,
    unregisterIP,

    // initializer
    initialize,
    teardown,
  });
};

/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const IPBlacklistService = ipBlacklistServiceFactory();

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export { IPBlacklistService };
