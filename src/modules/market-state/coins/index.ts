import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import { buildDefaultConfig } from './utils.js';
import { ICoinsService, ICoinsConfig } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Coins Service Factory
 * Generates the object in charge of keeping Balancer in sync with the state of the top coins.
 * @returns ICoinsService
 */
const coinsServiceFactory = (): ICoinsService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the module's configuration
  let __config: IRecordStore<ICoinsConfig>;





  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Tears down the Coins Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {

  };

  /**
   * Initializes the Coins Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the configuration
    __config = await recordStoreFactory('COINS', buildDefaultConfig());

    //
  };





  /* **********************************************************************************************
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get config() {
      return __config.value;
    },

    // initializer
    initialize,
    teardown,

    // configuration

  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const CoinsService = coinsServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  CoinsService,
};
