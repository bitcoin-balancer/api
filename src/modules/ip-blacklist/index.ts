import { encodeError } from 'error-message-utils';
import { IIPBlacklistRecord, IIPBlacklistService } from './types.js';
import { sanitizeIP } from './utils.js';
import { listIPs, createRecord, updateRecord } from './model.js';

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
      throw new Error(encodeError(`The ip '${sip}' is blacklisted and should not be served.`, 5000));
    }
  };





  /* **********************************************************************************************
   *                                           RETRIEVERS                                         *
   ********************************************************************************************** */




  /* **********************************************************************************************
   *                                        RECORD MANAGEMENT                                     *
   ********************************************************************************************** */

  /**
   * Registers an IP Address in the Blacklist. Once registered, the API won't serve future requests
   * sent by the IP.
   * @param ip
   * @param notes
   * @returns Promise<IIPBlacklistRecord>
   */
  const registerIP = async (ip: string, notes: string | undefined): Promise<IIPBlacklistRecord> => {
    // init values
    const sip = sanitizeIP(ip);
    const snotes = typeof notes === 'string' && notes.length ? notes : undefined;
    const eventTime = Date.now();

    // validate the request
    // @TODO

    // register the record and return it
    const id = await createRecord(sip, snotes, eventTime);
    __blacklist[sip] = true;
    return {
      id,
      ip: sip,
      notes: snotes,
      event_time: eventTime,
    };
  };

  const updateIPRegistration = async (): Promise<void> => {

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
    // ...

    // record management
    registerIP,

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
export {
  IPBlacklistService,
};
