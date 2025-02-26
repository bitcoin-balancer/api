/* eslint-disable no-console */
import ms from 'ms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { retryAsyncFunction } from 'web-utils-kit';
import { recordStoreFactory, IRecordStore } from '../../shared/record-store/index.js';
import { APIErrorService } from '../../api-error/index.js';
import {
  ICompactCandlestickRecords,
  buildPristineCompactCandlestickRecords,
} from '../../shared/candlestick/index.js';
import { ExchangeService } from '../../shared/exchange/index.js';
import { calculateStateForSeries } from '../shared/utils.js';
import { buildDefaultConfig, buildPristineState, getConfigUpdatePostActions } from './utils.js';
import { validateInitialCandlesticks, canConfigBeUpdated } from './validations.js';
import { broadcastState, broadcastInvalidWindowIntegrity } from './notifications.js';
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
  let __windowVal = buildPristineCompactCandlestickRecords();
  const __window = new BehaviorSubject(__windowVal);

  // the module's configuration
  let __config: IRecordStore<IWindowConfig>;

  // the candlesticks will be refetched every __config.refetchFrequency seconds
  let __refetchInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                            STREAM                                            *
   ********************************************************************************************** */

  /**
   * Generates a subscription to the window stream.
   * @param callback
   * @returns Subscription
   */
  const subscribe = (callback: (value: ICompactCandlestickRecords) => any): Subscription => (
    __window.subscribe(callback)
  );





  /* **********************************************************************************************
   *                                           FETCHER                                            *
   ********************************************************************************************** */

  /**
   * Fires when the module is being initialized or if the configuration is changed in a way that
   * requires the module to be teared down and re-initialized.
   * @param candlesticks
   * @throws
   * - 21507: if the number of candlesticks doesn't match the window size
   */
  const __handleInitialCandlesticks = (candlesticks: ICompactCandlestickRecords): void => {
    validateInitialCandlesticks(candlesticks, __config.value);
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
    __windowVal.high[__windowVal.id.length - 1] = candlesticks.high[candlesticks.id.length - 1];
    __windowVal.low[__windowVal.id.length - 1] = candlesticks.low[candlesticks.id.length - 1];
    __windowVal.close[__windowVal.id.length - 1] = candlesticks.close[candlesticks.id.length - 1];
  };

  /**
   * Fires whenever the candlesticks are fetched. It updates the local window and broadcasts the
   * changes.
   * @param startTime
   * @param candlesticks
   * @throws
   * - 21507: if the number of candlesticks doesn't match the window size
   */
  const __onCandlestickChanges = (
    startTime: number | undefined,
    candlesticks: ICompactCandlestickRecords,
  ): void => {
    if (startTime === undefined) {
      __handleInitialCandlesticks(candlesticks);
      __window.next(__windowVal);
    } else if (
      candlesticks.id[candlesticks.id.length - 1] > __windowVal.id[__windowVal.id.length - 1]
    ) {
      __handleNewCandlestick(candlesticks);
      __window.next(__windowVal);
    } else if (
      __windowVal.id[__windowVal.id.length - 1] === candlesticks.id[candlesticks.id.length - 1]
    ) {
      __handleCanclestickUpdate(candlesticks);
      __window.next(__windowVal);
    } else {
      broadcastInvalidWindowIntegrity();
    }
  };

  /**
   * Retrieves the candlesticks from the API and broadcasts the latest data.
   * @param startTime?
   * @returns Promise<void>
   */
  const __fetchCandlesticks = async (startTime?: number): Promise<void> => __onCandlestickChanges(
    startTime,
    await ExchangeService.getCandlesticks(
      __config.value.interval,
      __config.value.size,
      startTime,
    ),
  );





  /* **********************************************************************************************
   *                                       STATE CALCULATOR                                       *
   ********************************************************************************************** */

  /**
   * Calculates the current window state and returns it. If the state is strong, it will send a
   * notification.
   * @returns IWindowState
   */
  const calculateState = (): IWindowState => {
    try {
      // calculate the state
      const { mean, splits } = calculateStateForSeries(
        __windowVal.close,
        __config.value.requirement,
        __config.value.strongRequirement,
      );

      // send a notification if the market is moving strongly
      if (mean === 2 || mean === -2) {
        broadcastState(mean, __windowVal.close.at(-1)!, splits.s100.change);
      }

      // finally, return the state
      return { state: mean, splitStates: splits, window: __windowVal };
    } catch (e) {
      // if the state cannot be calculated for any reason, re-sync the whole window
      __fetchCandlesticks()
        .then(() => console.log('The window has been re-synced successfully.'))
        .catch(console.error);
      throw e;
    }
  };


  /**
   * Builds the default window state.
   * @returns IWindowState
   */
  const getPristineState = (): IWindowState => buildPristineState();





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
    }, ms(`${__config.value.refetchFrequency} seconds`));
  };

  /**
   * Initializes the Window Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the configuration
    __config = await recordStoreFactory('WINDOW', buildDefaultConfig());

    // fetch the candlesticks
    await retryAsyncFunction(() => __fetchCandlesticks(), [3, 5, 15, 45, 120]);

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
   * Fires whenever the configuration changes and executes the post update actions (if any).
   * @param shouldReInitialize
   * @param shouldFetchInitialCandlesticks
   * @returns Promise<void>
   */
  const __onConfigChanges = async (
    shouldReInitialize: boolean,
    shouldFetchInitialCandlesticks: boolean,
  ): Promise<void> => {
    if (shouldReInitialize) {
      try {
        await teardown();
        await initialize();
      } catch (e) {
        APIErrorService.save(
          'WindowService.updateConfiguration.shouldReInitialize',
          e,
          undefined,
          undefined,
          { shouldReInitialize, shouldFetchInitialCandlesticks },
        );
        __initializeRefetchInterval();
      }
    } else if (shouldFetchInitialCandlesticks) {
      try {
        await retryAsyncFunction(() => __fetchCandlesticks(), [3, 5, 15, 45, 120]);
      } catch (e) {
        APIErrorService.save(
          'WindowService.updateConfiguration.shouldFetchInitialCandlesticks',
          e,
          undefined,
          undefined,
          { shouldReInitialize, shouldFetchInitialCandlesticks },
        );
      }
    }
  };

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
    // validate the request
    canConfigBeUpdated(newConfig);

    // retrieve the post update actions
    const {
      shouldReInitialize,
      shouldFetchInitialCandlesticks,
    } = getConfigUpdatePostActions(__config.value, newConfig);

    // update the config
    await __config.update(newConfig);

    // execute post actions
    __onConfigChanges(shouldReInitialize, shouldFetchInitialCandlesticks);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get config() {
      return __config.value;
    },

    // stream
    subscribe,

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

  // types
  type IWindowState,
};
