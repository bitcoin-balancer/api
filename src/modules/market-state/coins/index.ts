import { Subscription } from 'rxjs';
import { invokeFuncPersistently } from '../../shared/utils/index.js';
import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { ICompactCandlestickRecords } from '../../shared/candlestick/index.js';
import { ExchangeService, ITickerWebSocketMessage } from '../../shared/exchange/index.js';
import { WindowService } from '../window/index.js';
import { buildDefaultConfig, buildPristineCoinsStates } from './utils.js';
import { canConfigBeUpdated } from './validations.js';
import {
  ICoinsService,
  ICoinsConfig,
  ICoinsState,
  ICompactCoinsStates,
} from './types.js';

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

  // the list of symbols that will be used by the module. e.g. 'BTC', 'ETH', ...
  let __topSymbols: string[];

  // the subscription to the window stream and the current BTC price
  let __windowStreamSub: Subscription;
  let __btcPrice: number;

  // the subscription to the tickers stream
  let __streamSub: Subscription;

  // the number of minutes the system will wait before evaluating the initialization and taking
  // actions if needed
  const __INITIALIZATION_EVALUATION_DELAY = 5;

  // the state in both assets, '*USD*' & 'BTC'
  let __quoteState: ICoinsState; // e.g. BTCUSDT
  let __baseState: ICoinsState; // e.g. ETHBTC





  /* **********************************************************************************************
   *                                      STATE CALCULATOR                                        *
   ********************************************************************************************** */

  /**
   * Builds the default coins states.
   * @returns ICoinsStates
   */
  const getPristineState = (): ICompactCoinsStates => buildPristineCoinsStates();





  /* **********************************************************************************************
   *                                       STREAM HANDLERS                                        *
   ********************************************************************************************** */

  /**
   * Fires whenever there is new BTC's candlesticks data.
   * @param candlesticks
   */
  const __onWindowChanges = (candlesticks: ICompactCandlestickRecords): void => {
    __btcPrice = candlesticks.close[candlesticks.id.length - 1];
  };

  /**
   * Fires whenever the price of one of many symbols changes.
   * @param data
   */
  const __onTickersChanges = (data: ITickerWebSocketMessage): void => {

  };





  /* **********************************************************************************************
   *                                  INITIALIZATION EVALUATION                                   *
   ********************************************************************************************** */

  /**
   * This function is invoked a few minutes after the module is initialized. It checks all of the
   * symbols to ensure they have received data. Otherwise, they will be removed.
   */
  const __evaluateInitialization = (): void => {
    // @TODO
  };





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Tears down the Coins Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    if (__windowStreamSub) {
      __windowStreamSub.unsubscribe();
    }
    if (__streamSub) {
      __streamSub.unsubscribe();
    }
  };

  /**
   * Retrieves the top symbols based on the module's configuration.
   * @returns Promise<string[]>
   */
  const __getTopSymbols = (): Promise<string[]> => invokeFuncPersistently(
    ExchangeService.getTopSymbols,
    [__config.value.whitelistedSymbols, __config.value.limit],
    [3, 5, 15, 60],
  );

  /**
   * Initializes the Coins Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // subscribe to the BTC price
    __windowStreamSub = WindowService.subscribe(__onWindowChanges);

    // initialize the configuration
    __config = await recordStoreFactory('COINS', buildDefaultConfig());

    // retrieve the exchange's top symbols
    __topSymbols = await __getTopSymbols();

    // initialize the state
    // @TODO

    // subscribe to the tickers stream
    __streamSub = ExchangeService.getTickersStream(__topSymbols).subscribe(__onTickersChanges);

    // check if any of the top symbols need to be removed
    setTimeout(__evaluateInitialization, __INITIALIZATION_EVALUATION_DELAY * (60 * 1000));
  };





  /* **********************************************************************************************
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */

  /**
   * Updates the configuration of the module.
   * @param newConfig
   * @throws
   * - 23500: if the config isn't a valid object
   * - 23501: if the window size is invalid
   * - 23502: if the interval is invalid
   * - 23503: if the state requirement is invalid
   * - 23504: if the strong state requirement is invalid
   * - 23505: if the whitelisted symbols is an invalid array
   * - 23506: if any of the whitelisted symbols is invalid
   * - 23507: if the limit is invalid
   */
  const updateConfiguration = async (newConfig: ICoinsConfig): Promise<void> => {
    // validate the request
    canConfigBeUpdated(newConfig);

    // update the config
    await __config.update(newConfig);

    // execute post actions
    try {
      await teardown();
      await initialize();
    } catch (e) {
      APIErrorService.save('CoinsService.updateConfiguration.postActions', e);
    }
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
const CoinsService = coinsServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  CoinsService,

  // types
  type ICompactCoinsStates,
};
