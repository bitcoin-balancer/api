import { Observable } from 'rxjs';
import { invokeFuncPersistently } from '../../shared/utils/index.js';
import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService, ITickerWebSocketMessage } from '../../shared/exchange/index.js';
import { buildDefaultConfig } from './utils.js';
import { canConfigBeUpdated } from './validations.js';
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

  // the list of symbols that will be used by the module. e.g. 'BTC', 'ETH', ...
  let __topSymbols: string[];

  // the subscription to the tickers stream
  let __stream: Observable<ITickerWebSocketMessage>;





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
    // initialize the configuration
    __config = await recordStoreFactory('COINS', buildDefaultConfig());

    // retrieve the exchange's top symbols
    __topSymbols = await __getTopSymbols();


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
  CoinsService,
};
