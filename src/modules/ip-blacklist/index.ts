import { encodeError } from 'error-message-utils';
import { IIPBlacklistService } from './types.js';
import { sanitizeIP } from './utils.js';
import { listIPs } from './model.js';

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
      throw new Error(encodeError(`The ip '${ip}' is blacklisted and should not be served.`, 5000));
    }
  };





  /* **********************************************************************************************
   *                                           RETRIEVERS                                         *
   ********************************************************************************************** */




  /* **********************************************************************************************
   *                                        RECORD MANAGEMENT                                     *
   ********************************************************************************************** */

  const someAction = () => {
    // ...
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
    someAction,

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
