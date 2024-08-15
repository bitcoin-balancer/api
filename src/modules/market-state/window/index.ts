import { BehaviorSubject } from 'rxjs';
import { encodeError } from 'error-message-utils';
import { invokeFuncPersistently } from '../../shared/utils/index.js';
import { recordStoreFactory, IRecordStore } from '../../shared/record-store/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { NotificationService } from '../../notification/index.js';
import { ICompactCandlestickRecords, buildPristineCompactCandlestickRecords } from '../../shared/candlestick/index.js';
import { ExchangeService } from '../../shared/exchange/index.js';
import { buildDefaultConfig, buildPristineState } from './utils.js';
import { canConfigBeUpdated } from './validations.js';
import { IWindowConfig, IWindowService, IWindowState } from './types.js';


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
  let __windowVal: ICompactCandlestickRecords;
  const __window = new BehaviorSubject<ICompactCandlestickRecords>(
    buildPristineCompactCandlestickRecords(),
  );

  // the module's configuration
  let __config: IRecordStore<IWindowConfig>;

  // the candlesticks will be refetched every __config.refetchFrequency seconds
  let __refetchInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                       STATE CALCULATOR                                       *
   ********************************************************************************************** */

  const calculateState = (): IWindowState => <IWindowState>{};


  /**
   * Builds the default window state.
   * @returns IWindowState
   */
  const getPristineState = (): IWindowState => buildPristineState();





  /* **********************************************************************************************
   *                                           FETCHER                                            *
   ********************************************************************************************** */

  /**
   * Fires when the module is being initialized or if the configuration is changed in a way that
   * requires the module to be teared down and re-initialized.
   * @param candlesticks
   */
  const __handleInitialCandlesticks = (candlesticks: ICompactCandlestickRecords): void => {
    if (candlesticks.id.length !== __config.value.size) {
      throw new Error(encodeError(`The number of candlesticks retrieved from the exchange '${candlesticks.id.length}' doesn't match the window size set in the configuration '${__config.value.size}'`, 21000));
    }
    __windowVal = candlesticks;
  };

  /**
   * Fires when a new candlestick record comes into existance (new period).
   * @param candlesticks
   */
  const __handleNewCandlestick = (candlesticks: ICompactCandlestickRecords): void => {
    // drop the oldest candlestick
    __windowVal.id.shift();
    __windowVal.open.shift();
    __windowVal.high.shift();
    __windowVal.low.shift();
    __windowVal.close.shift();

    // update the last existing candlestick
    __windowVal.open[__windowVal.id.length - 1] = candlesticks.open[candlesticks.id.length - 2];
    __windowVal.high[__windowVal.id.length - 1] = candlesticks.high[candlesticks.id.length - 2];
    __windowVal.low[__windowVal.id.length - 1] = candlesticks.low[candlesticks.id.length - 2];
    __windowVal.close[__windowVal.id.length - 1] = candlesticks.close[candlesticks.id.length - 2];

    // add the new one
    __windowVal.id.push(candlesticks.id[candlesticks.id.length - 1]);
    __windowVal.open.push(candlesticks.open[candlesticks.id.length - 1]);
    __windowVal.high.push(candlesticks.high[candlesticks.id.length - 1]);
    __windowVal.low.push(candlesticks.low[candlesticks.id.length - 1]);
    __windowVal.close.push(candlesticks.close[candlesticks.id.length - 1]);
  };

  /**
   * Fires whenever there is a newer version of the current candlestick.
   * @param candlesticks
   */
  const __handleCanclestickUpdate = (candlesticks: ICompactCandlestickRecords): void => {
    __windowVal.open[__windowVal.id.length - 1] = candlesticks.open[candlesticks.id.length - 1];
    __windowVal.high[__windowVal.id.length - 1] = candlesticks.high[candlesticks.id.length - 1];
    __windowVal.low[__windowVal.id.length - 1] = candlesticks.low[candlesticks.id.length - 1];
    __windowVal.close[__windowVal.id.length - 1] = candlesticks.close[candlesticks.id.length - 1];
  };

  /**
   * Fires whenever the candlesticks are fetched. It updates the local window and broadcasts the
   * changes.
   * @param startTime
   * @param candlesticks
   */
  const __onCandlestickChanges = (
    startTime: number | undefined,
    candlesticks: ICompactCandlestickRecords,
  ): void => {
    // apply the changes on the local window
    if (startTime === undefined) {
      __handleInitialCandlesticks(candlesticks);
    } else if (__windowVal.id.at(-1) !== candlesticks.id.at(-1)) {
      __handleNewCandlestick(candlesticks);
    } else {
      __handleCanclestickUpdate(candlesticks);
    }

    // broadcast the new window
    __window.next(__windowVal);
  };

  /**
   * Retrieves the candlesticks from the API and broadcasts the latest data.
   * @param startTime?
   * @returns Promise<void>
   */
  const __fetchCandlesticks = async (startTime?: number): Promise<void> => {
    // retrieve the klines
    const candlesticks = await ExchangeService.getCandlesticks(
      __config.value.interval,
      __config.value.size,
      startTime,
    );

    // sync the local state
    __onCandlestickChanges(startTime, candlesticks);
  };






  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the refetch interval in order to keep the candlesticks in sync.
   */
  const __initializeRefetchInterval = (): void => {
    __refetchInterval = setInterval(async () => {
      try {
        await __fetchCandlesticks(__windowVal.id.at(-1));
      } catch (e) {
        APIErrorService.save('WindowService.__refetchInterval', e);
      }
    }, __config.value.refetchFrequency * 1000);
  };

  /**
   * Initializes the Window Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the configuration
    __config = await recordStoreFactory('WINDOW', buildDefaultConfig());

    // fetch the candlesticks
    await invokeFuncPersistently(__fetchCandlesticks, undefined, [3, 5, 15, 45, 120]);

    // initialize the refetch interval
    __initializeRefetchInterval();
  };

  /**
   * Tears down the Window Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    clearInterval(__refetchInterval);
  };





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
    // refetch the whole window @TODO
    // if the refetchFrequency changed, teardown and initialize again
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get window() {
      return __window;
    },
    get config() {
      return __config.value;
    },

    // state calculator
    calculateState,
    getPristineState,

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
const WindowService = windowServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  WindowService,

  // utils
  // ...

  // types
  type IWindowState,
};
