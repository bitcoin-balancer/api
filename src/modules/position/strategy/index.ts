import { recordStoreFactory, IRecordStore } from '../../shared/record-store/index.js';
import { buildDefaultConfig } from './utils.js';
import { IStrategyService, IStrategy, IDecreaseLevel } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Strategy Service Factory
 * Generates the object in charge of managing the configuration that will be used to manage
 * positions.
 * @returns IStrategyService
 */
const strategyServiceFactory = (): IStrategyService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the module's configuration
  let __config: IRecordStore<IStrategy>;





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Strategy Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the configuration
    __config = await recordStoreFactory('STRATEGY', buildDefaultConfig());

    // ...
  };

  /**
   * Tears down the Strategy Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {

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
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const StrategyService = strategyServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  StrategyService,

  // types
  type IStrategy,
  type IDecreaseLevel,
};
