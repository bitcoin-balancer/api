import { recordStoreFactory, IRecordStore } from '../../shared/record-store/index.js';
import { buildDefaultConfig } from './utils.js';
import { canConfigBeUpdated } from './validations.js';
import {
  IStrategyService,
  IStrategy,
  IDecreaseLevel,
  IDecreaseLevels,
} from './types.js';

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
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */

  /**
   * Updates the configuration of the module.
   * @param newConfig
   * @throws
   * - 31500: if the config is not a valid object
   * - 31501: if the canIncrease property is not a boolean
   * - 31502: if the canDecrease property is not a boolean
   * - 31503: if the increaseAmountQuote property is not a valid number
   * - 31504: if the minPositionAmountQuote property is not a valid number
   * - 31505: if the increaseIdleDuration property is not a valid number
   * - 31506: if the increaseGainRequirement property is not a valid number
   * - 31507: if the decreaseLevels property is not a valid tuple
   * - 31508: if any of the price levels' gainRequirement property is invalid
   * - 31509: if any of the price levels' percentage property is invalid
   * - 31510: if any of the price levels' frequency property is invalid
   */
  const updateConfiguration = async (newConfig: IStrategy): Promise<void> => {
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
  type IDecreaseLevels,
};
