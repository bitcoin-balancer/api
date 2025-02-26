import ms from 'ms';
import { Subscription } from 'rxjs';
import { extractMessage } from 'error-message-utils';
import { retryAsyncFunction } from 'web-utils-kit';
import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { NotificationService } from '../../notification/index.js';
import { ICompactCandlestickRecords } from '../../shared/candlestick/index.js';
import { ExchangeService, ITickerWebSocketMessage } from '../../shared/exchange/index.js';
import { ISplitStateItem, IState, IStateResult } from '../shared/types.js';
import { calculateStateForSeries, calculateStateMean } from '../shared/utils.js';
import { WindowService } from '../window/index.js';
import {
  isBaseAsset,
  buildDefaultConfig,
  buildPristineCoinsState,
  buildPristineCoinsStates,
  calculateSymbolPriceInBaseAsset,
  isIntervalActive,
  buildPristineSplitStates,
  toSemiCompact,
} from './utils.js';
import { validateStateAsset, validateSymbol, canConfigBeUpdated } from './validations.js';
import {
  ICoinsService,
  ICoinStateAsset,
  ICoinState,
  ISemiCompactCoinState,
  ICompactCoinState,
  ICoinsState,
  ICoinsStates,
  IStatesBySymbol,
  ICoinsStatesCalculationPayload,
  ICoinsConfig,
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

  // the subscription to the window stream and the current base asset price
  let __windowStreamSub: Subscription;
  let __baseAssetPrice: number;

  // the subscription to the tickers stream
  let __streamSub: Subscription;

  // the number of minutes the system will wait before evaluating the initialization and taking
  // actions if needed
  const __INITIALIZATION_EVALUATION_DELAY = 10;

  // the number of decimal places that will be used to calculate the price in base asset
  // e.g. ETHBTC, XRPBTC, etc ... this is needed because some coins are worth less than 1 satoshi
  const BASE_ASSET_PRICE_DP = 16;

  // the state in both assets, '*USD*' & 'BTC'
  let __quote: ICoinsState<ICoinState>; // e.g. BTCUSDT
  let __base: ICoinsState<ICoinState>; // e.g. ETHBTC





  /* **********************************************************************************************
   *                                         RETRIEVERS                                           *
   ********************************************************************************************** */

  /**
   * Retrieves the state object for a coin based on an asset.
   * @param asset
   * @param symbol
   * @returns ICoinState
   * @throws
   * - 23508: if the state asset is invalid
   * - 23510: if the symbol is not in the asset's statesBySymbol object
   */
  const getStateForSymbol = (asset: ICoinStateAsset, symbol: string): ICoinState => {
    validateSymbol(
      symbol,
      asset,
      asset === 'quote' ? __quote.statesBySymbol : __base.statesBySymbol,
    );
    return asset === 'quote' ? __quote.statesBySymbol[symbol] : __base.statesBySymbol[symbol];
  };

  /**
   * Retrieves the semi-compact state for an asset.
   * @param asset
   * @throws
   * - 23508: if the state asset is invalid
   */
  const getSemiCompactStateForAsset = (
    asset: ICoinStateAsset,
  ): ICoinsState<ISemiCompactCoinState> => {
    validateStateAsset(asset);
    return toSemiCompact(asset === 'quote' ? __quote : __base);
  };





  /* **********************************************************************************************
   *                                      STATE CALCULATOR                                        *
   ********************************************************************************************** */

  /**
   * Calculates the state for a symbol's window.
   * @param window
   * @returns IStateResult
   */
  const __calculateStateForWindow = (window: ISplitStateItem[]): IStateResult => (
    window.length === __config.value.size
      ? calculateStateForSeries(
        window,
        __config.value.requirement,
        __config.value.strongRequirement,
      )
      : { mean: 0, splits: buildPristineSplitStates() }
  );

  /**
   * Calculates the state for a symbol, mutates the local copy and returns the new quote and base
   * states.
   * @param symbol
   * @returns { quoteResult: IStateResult, baseResult: IStateResult | undefined }
   */
  const __calculateAndUpdateStateForSymbol = (
    symbol: string,
  ): { quoteResult: IStateResult, baseResult: IStateResult | undefined } => {
    // calculate the state for the quote pair
    const quoteResult = __calculateStateForWindow(__quote.statesBySymbol[symbol].window);
    __quote.statesBySymbol[symbol].state = quoteResult.mean;
    __quote.statesBySymbol[symbol].splitStates = quoteResult.splits;

    // calculate the state for the base pair (if possible)
    let baseResult: IStateResult | undefined;
    if (!isBaseAsset(symbol)) {
      baseResult = __calculateStateForWindow(__base.statesBySymbol[symbol].window);
      __base.statesBySymbol[symbol].state = baseResult.mean;
      __base.statesBySymbol[symbol].splitStates = baseResult.splits;
    }

    // finally, return both states
    return { quoteResult, baseResult };
  };

  /**
   * Calculates the current state of the coins module and returns it in its compact and semi-compact
   * variants.
   * @returns ICoinsStatesCalculationPayload
   */
  const calculateState = (): ICoinsStatesCalculationPayload => {
    // init values
    const quoteStatesBySymbol: IStatesBySymbol = { compact: {}, semiCompact: {} };
    const baseStatesBySymbol: IStatesBySymbol = { compact: {}, semiCompact: {} };
    const quoteStates: IState[] = [];
    const baseStates: IState[] = [];

    // calculate the state for each symbol and update the local copy
    Object.keys(__quote.statesBySymbol).forEach((symbol) => {
      // calculate the states for both pairs
      const { quoteResult, baseResult } = __calculateAndUpdateStateForSymbol(symbol);

      // include the state payload for the quote pair
      quoteStatesBySymbol.compact[symbol] = { state: quoteResult.mean };
      quoteStatesBySymbol.semiCompact[symbol] = {
        state: quoteResult.mean,
        splitStates: quoteResult.splits,
      };
      quoteStates.push(quoteResult.mean);

      // include the state payload for the base pair (if any)
      if (baseResult) {
        baseStatesBySymbol.compact[symbol] = { state: baseResult.mean };
        baseStatesBySymbol.semiCompact[symbol] = {
          state: baseResult.mean,
          splitStates: baseResult.splits,
        };
        baseStates.push(baseResult.mean);
      }
    });

    // calculate the top level states
    __quote.state = calculateStateMean(quoteStates);
    __base.state = calculateStateMean(baseStates);

    // finally, return the state in the required formats
    return {
      compact: {
        quote: {
          state: __quote.state,
          statesBySymbol: quoteStatesBySymbol.compact,
        },
        base: {
          state: __base.state,
          statesBySymbol: baseStatesBySymbol.compact,
        },
      },
      semiCompact: {
        quote: {
          state: __quote.state,
          statesBySymbol: quoteStatesBySymbol.semiCompact,
        },
        base: {
          state: __base.state,
          statesBySymbol: baseStatesBySymbol.semiCompact,
        },
      },
    };
  };

  /**
   * Builds the default coins states.
   * @returns ICoinsStates<ICompactCoinState>
   */
  const getPristineState = (): ICoinsStates<ICompactCoinState> => buildPristineCoinsStates();





  /* **********************************************************************************************
   *                                       STREAM HANDLERS                                        *
   ********************************************************************************************** */

  /**
   * Fires whenever there is new base asset's pricing data.
   * @param candlesticks
   */
  const __onWindowChanges = (candlesticks: ICompactCandlestickRecords): void => {
    __baseAssetPrice = candlesticks.close[candlesticks.id.length - 1];
  };

  /**
   * Fires whenever the price for a symbol changes. It checks the current window and handles the
   * changes accordingly for both, the quote and the base states.
   * NOTE: the base state does not contain the base asset (Bitcoin).
   * @param symbol
   * @param newPrice
   * @param currentTime
   */
  const __onPriceChanges = (symbol: string, newPrice: number, currentTime: number): void => {
    // if the interval is active, update the latest price. Otherwise, append it
    const lastIdx = __quote.statesBySymbol[symbol].window.length - 1;
    if (isIntervalActive(
      __quote.statesBySymbol[symbol].window[lastIdx]?.x,
      __config.value.interval,
      currentTime,
    )) {
      __quote.statesBySymbol[symbol].window[lastIdx].y = newPrice;
      if (!isBaseAsset(symbol)) {
        __base.statesBySymbol[symbol].window[lastIdx].y = calculateSymbolPriceInBaseAsset(
          newPrice,
          __baseAssetPrice,
          BASE_ASSET_PRICE_DP,
        );
      }
    } else {
      __quote.statesBySymbol[symbol].window.push({ x: currentTime, y: newPrice });
      if (!isBaseAsset(symbol)) {
        __base.statesBySymbol[symbol].window.push({
          x: currentTime,
          y: calculateSymbolPriceInBaseAsset(newPrice, __baseAssetPrice, BASE_ASSET_PRICE_DP),
        });
      }
    }

    // make sure the size of the window is maintained
    if (__quote.statesBySymbol[symbol].window.length > __config.value.size) {
      __quote.statesBySymbol[symbol].window = __quote.statesBySymbol[symbol].window.slice(
        -(__config.value.size),
      );
      if (!isBaseAsset(symbol)) {
        __base.statesBySymbol[symbol].window = __base.statesBySymbol[symbol].window.slice(
          -(__config.value.size),
        );
      }
    }
  };

  /**
   * Fires whenever the price of one of many symbols changes. It checks if the symbol/s are
   * currently supported and updates the price.
   * @param data
   */
  const __onTickersChanges = (data: ITickerWebSocketMessage): void => {
    const ts = Date.now();
    Object.keys(data).forEach((symbol) => {
      if (__quote.statesBySymbol[symbol]) {
        __onPriceChanges(symbol, data[symbol], ts);
      }
    });
  };





  /* **********************************************************************************************
   *                                  INITIALIZATION EVALUATION                                   *
   ********************************************************************************************** */

  /**
   * This function is invoked a few minutes after the module is initialized. It checks all of the
   * symbols to ensure they have received data. Otherwise, they are removed.
   */
  const __evaluateInitialization = (): void => {
    Object.keys(__base.statesBySymbol).forEach((symbol) => {
      if (__quote.statesBySymbol[symbol].window.length === 0) {
        delete __quote.statesBySymbol[symbol];
        delete __base.statesBySymbol[symbol];
      }
    });
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
  const __getTopSymbols = (): Promise<string[]> => retryAsyncFunction(
    () => ExchangeService.getTopSymbols(__config.value.whitelistedSymbols, __config.value.limit),
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
    const topSymbols = await __getTopSymbols();

    // initialize the state
    __quote = buildPristineCoinsState(topSymbols);
    __base = buildPristineCoinsState(topSymbols.filter((symbol) => !isBaseAsset(symbol)));

    // subscribe to the tickers stream
    __streamSub = ExchangeService.getTickersStream(topSymbols).subscribe(__onTickersChanges);

    // check if any of the top symbols need to be removed
    setTimeout(__evaluateInitialization, ms(`${__INITIALIZATION_EVALUATION_DELAY} minutes`));
  };

  /**
   * Tears down and re-initializes the Coins Module. Keep in mind this method triggers a coin
   * rotation that will reset the current state.
   * Note: this function is safe to invoke as it doesn't throw errors.
   * @returns Promise<void>
   */
  const teardownAndInitializeModule = async (): Promise<void> => {
    try {
      await teardown();
      await initialize();
    } catch (e) {
      const msg = extractMessage(e);
      APIErrorService.save('CoinsService.teardownAndInitializeModule', msg);
      NotificationService.coinsReInitError(msg);
    }
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
   * - 23509: if the whitelist doesn't include the base asset
   * - 23511: if the requirement is equals or larger than the strongRequirement
   */
  const updateConfiguration = async (newConfig: ICoinsConfig): Promise<void> => {
    // validate the request
    canConfigBeUpdated(newConfig);

    // update the config
    await __config.update(newConfig);

    // execute post actions
    await teardownAndInitializeModule();
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    get config() {
      return __config.value;
    },

    // retrievers
    getStateForSymbol,
    getSemiCompactStateForAsset,

    // state calculator
    calculateState,
    getPristineState,

    // initializer
    initialize,
    teardown,
    teardownAndInitializeModule,

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
  type ICoinStateAsset,
  type ICoinState,
  type ISemiCompactCoinState,
  type ICompactCoinState,
  type ICoinsState,
  type ICoinsStates,
};
