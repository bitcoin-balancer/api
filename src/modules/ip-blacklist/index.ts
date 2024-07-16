import { listIPs } from './model.js';
import { IIPBlacklistService } from './types.js';

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
   *                                            ACTIONS                                           *
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

    // actions
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
