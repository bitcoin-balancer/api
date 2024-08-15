import { recordStoreFactory, IRecordStore } from '../../shared/record-store/index.js';
import { NotificationService } from '../../notification/index.js';
import { canConfigBeUpdated } from './validations.js';
import { IWindowConfig, IWindowService } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Window Service Factory
 * Generates the object in charge of keeping Balancer in sync with the market's candlesticks and 
 * calculating its state.
 * @returns IWindowService
 */
const windowServiceFactory = (): IWindowService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the module's configuration
  let __config: IRecordStore<IWindowConfig>;




  /* **********************************************************************************************
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */

  /**
   * Updates the configuration of the module.
   * @param newConfig
   * @throws
   * - 21500: if the config isn't a valid object
   * - 21501: if the refetch frequency is invalid
   * - 21502: if the requirement is invalid
   * - 21503: if the strong requirement is invalid
   * - 21504: if the requirement is greater than or equals to the strong requirement
   */
  const updateConfiguration = async (newConfig: IWindowConfig): Promise<void> => {
    canConfigBeUpdated(newConfig);
    await __config.update(newConfig);
  };





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Market State Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {

  };

  /**
   * Tears down the Market State Module.
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

    // configuration
    updateConfiguration,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const WindowService = windowServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  WindowService,
};
