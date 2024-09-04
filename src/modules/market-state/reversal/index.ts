import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import { buildDefaultConfig } from './utils.js';
import { canConfigBeUpdated } from './validations.js';
import {
  IReversalConfig,
  IReversalService,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Reversal Service Factory
 * Generates the object in charge of evaluating if a price crash has the potential to reverse.
 * @returns IReversalService
 */
const reversalServiceFactory = (): IReversalService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the module's configuration
  let __config: IRecordStore<IReversalConfig>;





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Reversal Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the configuration
    __config = await recordStoreFactory('REVERSAL', buildDefaultConfig());

    // ...
  };

  /**
   * Tears down the Reversal Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {

  };





  /* **********************************************************************************************
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */

  /**
   * Updates the configuration of the module.
   * @param newConfig
   * @throws
   * - 24500: if the new config is an invalid object
   * - 24501: if the crash duration is invalid
   * - 24502: if the crash idle duration is invalid
   * - 24503: if the points requirement is invalid
   * - 24504: if the weights property is an invalid object
   * - 24505: if the liquidity weight is invalid
   * - 24506: if the coins quote weight is invalid
   * - 24507: if the coins base weight is invalid
   */
  const updateConfiguration = async (newConfig: IReversalConfig): Promise<void> => {
    canConfigBeUpdated(newConfig);
    await __config.update(newConfig);
  };





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
    updateConfiguration,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const ReversalService = reversalServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  ReversalService,

  // types
};
