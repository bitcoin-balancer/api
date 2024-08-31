import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import { buildDefaultConfig } from './utils.js';
import {
  ILiquidityService,
  ILiquidityConfig,
} from './types.js';
import { canConfigBeUpdated } from './validations.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Liquidity Service Factory
 * Generates the object in charge of keeping Balancer in sync with the base asset's order book and
 * calculating its state.
 * @returns ILiquidityService
 */
const liquidityServiceFactory = (): ILiquidityService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the module's configuration
  let __config: IRecordStore<ILiquidityConfig>;





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Liquidity Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the configuration
    __config = await recordStoreFactory('LIQUIDITY', buildDefaultConfig());

    // initialize the order book stream
    // @TODO
  };

  /**
   * Tears down the Liquidity Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    // clearInterval(__refetchInterval);
  };





  /* **********************************************************************************************
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */

  /**
   * Updates the configuration of the module.
   * @param newConfig
   * @throws
   * - 22500: if the new config is not a valid object
   * - 22501: if the max distance from price is invalid
   * - 22502: if the intensity weights is not a valid object
   * - 22503: if any of the intensity weights is invalid
   */
  const updateConfiguration = async (newConfig: ILiquidityConfig): Promise<void> => {
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
const LiquidityService = liquidityServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  LiquidityService,
};
