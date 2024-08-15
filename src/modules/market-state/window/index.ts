import { recordStoreFactory, IRecordStore } from '../../shared/record-store/index.js';
import { NotificationService } from '../../notification/index.js';
import { ExchangeService } from '../../shared/exchange/index.js';
import { buildDefaultConfig, buildPristineState } from './utils.js';
import { canConfigBeUpdated } from './validations.js';
import { IWindowConfig, IWindowService, IWindowState } from './types.js';
import { ICompactCandlestickRecords } from '../../shared/candlestick/types.js';

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

  // the compact candlestick records that comprise the window
  let __window: ICompactCandlestickRecords;

  // the module's configuration
  let __config: IRecordStore<IWindowConfig>;

  // the candlesticks will be refetched every __config.refetchFrequency seconds
  let __refetchInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                       STATE CALCULATOR                                       *
   ********************************************************************************************** */

  /**
   * Builds the default window state.
   * @returns IWindowState
   */
  const getPristineState = (): IWindowState => buildPristineState();





  /* **********************************************************************************************
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */





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
   * - 21505: if the size of the window is an invalid integer
   * - 21506: if the interval is not supported
   */
  const updateConfiguration = async (newConfig: IWindowConfig): Promise<void> => {
    canConfigBeUpdated(newConfig);
    await __config.update(newConfig);
  };





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Window Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the alarms' configuration
    __config = await recordStoreFactory('WINDOW', buildDefaultConfig());

    // ...
  };

  /**
   * Tears down the Window Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    clearInterval(__refetchInterval);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get config() {
      return __config.value;
    },

    // state calculator
    getPristineState,

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
