/* eslint-disable no-console */
import { Subscription } from 'rxjs';
import { encodeError, extractMessage } from 'error-message-utils';
import {
  CandlestickService,
  eventHistoryFactory,
  IEventHistory,
  IEventHistoryRecord,
} from '../shared/candlestick/index.js';
import { ITrade } from '../shared/exchange/index.js';
import { IState } from '../market-state/shared/types.js';
import { MarketStateService, IMarketState } from '../market-state/index.js';
import { StrategyService } from './strategy/index.js';
import { BalanceService } from './balance/index.js';
import { TradeService } from './trade/index.js';
import {
  calculateMarketStateDependantProps,
  newReversalEventIssued,
} from './utils.js';
import {
  canPositionRecordBeRetrieved,
  canCompactPositionRecordsBeListed,
  canCompactPositionRecordsBeListedByRange,
} from './validations.js';
import {
  getPositionRecord,
  getActivePositionRecord,
  createPositionRecord,
  updatePositionRecord,
  listCompactPositionRecords,
  listCompactPositionRecordsByRange,
} from './model.js';
import {
  IPositionService,
  IPosition,
  ICompactPosition,
} from './types.js';

/* ************************************************************************************************
 *                                             NOTES                                              *
 ************************************************************************************************ */

/**
 * MINIMUM TRADING AMOUNT
 * At the time of coding this module (September 2024) the minimum trading amounts by exchange were:
 * - Binance:   0.00001 BTC ~1$   - https://www.binance.com/en/trade-rule
 * - Bitfinex:  0.00004 BTC ~2.5$ - https://support.bitfinex.com/hc/en-us/articles/115003283709-What-is-the-minimum-order-size-on-Bitfinex
 * - Kraken:    0.0001 BTC  ~10$  - https://support.kraken.com/hc/en-us/articles/205893708-Minimum-order-size-volume-for-trading
 * - Coinbase:  ?
 * - OKX:       0.00001 BTC ~1$   - https://www.okx.com/trade-market/info/spot
 */





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Position Service Factory
 * Generates the object in charge of opening, increasing and decreasing positions.
 * @returns IPositionService
 */
const positionServiceFactory = (): IPositionService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the number of decimal places the base asset can have
  const __BASE_ASSET_DP = 4;

  // the minimum amount of the base asset that can bought or sold
  const __MIN_ORDER_SIZE = 0.0001;

  // the active position (if any)
  let __active: IPosition | undefined;
  let __activeHist: IEventHistory | undefined;

  // the subscription to the market state's stream
  let __price: number;
  let __windowState: IState;
  let __lastReversalEventTime: number = 0;
  let __marketStateSub: Subscription;

  // the subscription to the trades' stream
  let __trades: ITrade[];
  let __tradesSub: Subscription;





  /* **********************************************************************************************
   *                                           HELPERS                                            *
   ********************************************************************************************** */

  /**
   * Invoked whenever an active position changes, keeping the current values in sync with the
   * history.
   */
  const __updatePositionHistory = (): void => {
    __activeHist!.handleNewData([__price, __active!.gain, __active!.entry_price, __active!.amount]);
  };





  /* **********************************************************************************************
   *                                 MARKET STATE EVENT HANDLERS                                  *
   ********************************************************************************************** */

  /**
   * Fires whenever there is a new market state. If there is an active position it will update all
   * of its dynamic properties to reflect the latest state and also keep the history updated.
   */
  const __handleMarketStateChanges = (): void => {
    if (__active) {
      // update the active position
      __active = {
        ...__active,
        ...calculateMarketStateDependantProps(
          __price,
          __active.entry_price,
          __active.amount,
          __active.amount_quote_in,
          __active.amount_quote_out,
        ),
      };

      // update the event history
      __updatePositionHistory();
    }
  };

  /**
   * Fires whenever a new reversal event is issued. It checks if a position should be opened or if
   * an open position should be increased.
   * @returns Promise<void>
   */
  const __handleNewReversalEvent = async (): Promise<void> => {
    if (StrategyService.config.canIncrease) {
      // ...
    }
  };

  /**
   * Fires whenever the market is increasing strongly. It checks if there is an active position and
   * if it should be decreased.
   * @returns Promise<void>
   */
  const __handleStronglyIncreasingWindow = async (): Promise<void> => {
    if (StrategyService.config.canDecrease && __active) {
      // ...
    }
  };





  /* **********************************************************************************************
   *                                    TRADES EVENT HANDLERS                                     *
   ********************************************************************************************** */




  const __handleNewPosition = async (): Promise<void> => {

  };

  const __handlePositionChanges = (): void => {

  };





  /* **********************************************************************************************
   *                                           STREAMS                                            *
   ********************************************************************************************** */

  /**
   * Fires whenever a new market state is calculated. Updates the local properties and handles any
   * events that could be triggered by the market state.
   * @param nextState
   */
  const __onMarketStateChanges = (nextState: IMarketState): void => {
    // update local properties
    __price = nextState.windowState.window.close[nextState.windowState.window.close.length - 1];
    __windowState = nextState.windowState.state;

    // handle the syncing of the active position (if any)
    __handleMarketStateChanges();

    // handle a new reversal event if it has been issued
    if (newReversalEventIssued(__lastReversalEventTime, nextState)) {
      __lastReversalEventTime = nextState.reversalState!.reversalEventTime as number;
      __handleNewReversalEvent();
    }

    // handle a strongly increasing window state
    if (__windowState === 2) {
      __handleStronglyIncreasingWindow();
    }
  };

  /**
   * Fires whenever the trades for an active position change in any way. It will check if a new
   * position has been opened or if the active position has changed. If so, it updates the handle
   * the appropriate event.
   * @param nextState
   */
  const __onTradesChanges = (nextState: ITrade[]): void => {
    if (__trades.length === 0 && nextState.length > 0) {
      __trades = nextState;
      __handleNewPosition();
    } else if (__trades.length > 0 && nextState.length > __trades.length) {
      __handlePositionChanges();
    }
  };





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves a position record from the local property or from the database by ID.
   * @param id
   * @returns Promise<IPosition>
   * @throws
   * - 30500: if the ID is not a valid uuid v4
   * - 30000: if the position does not exist
   */
  const getPosition = async (id: string): Promise<IPosition> => {
    canPositionRecordBeRetrieved(id);

    // check if the user is asking for the active position. Otherwise, retrieve it
    if (__active && __active.id === id) {
      return __active;
    }
    const record = await getPositionRecord(id);
    if (!record) {
      throw new Error(encodeError(`The position '${id}' was not found in the database.`, 30000));
    }
    return record;
  };

  /**
   * Validates and retrieves a list of compact position records.
   * @param limit
   * @param startAtOpenTime
   * @returns Promise<ICompactPosition[]>
   * @throws
   * - 30501: if the number of requested records exceeds the limit
   * - 30502: if the startAtOpenTime is not a valid timestamp
   */
  const listCompactPositions = (
    limit: number,
    startAtOpenTime: number | undefined,
  ): Promise<ICompactPosition[]> => {
    canCompactPositionRecordsBeListed(limit, startAtOpenTime);
    return listCompactPositionRecords(limit, startAtOpenTime);
  };

  /**
   * Retrieves a list of compact positions that were opened within a date range.
   * @param startAt
   * @param endAt?
   * @returns Promise<ICompactPosition[]>
   * @throws
   * - 30503: if the startAt timestamp is invalid
   * - 30504: if an invalid endAt is provided
   * - 30505: if the startAt is greater than or equals than the endAt
   * - 30506: if the difference between the startAt and the endAt exceeds the limit
   */
  const listCompactPositionsByRange = (
    startAt: number,
    endAt: number | undefined,
  ): Promise<ICompactPosition[]> => {
    canCompactPositionRecordsBeListedByRange(startAt, endAt);
    return listCompactPositionRecordsByRange(startAt, endAt);
  };

  /**
   * Retrieves the history in OHLC format for an active position.
   * @param id
   * @returns Promise<IEventHistoryRecord>
   * @throws
   * - 11000: if the id has an invalid format
   * - 11001: if the record was not found in the database
   */
  const getPositionHistory = (id: string): Promise<IEventHistoryRecord> => (
    CandlestickService.getEventHistory(id)
  );





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Tears down the Position Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    // unsubscribe from the market state's stream
    __marketStateSub?.unsubscribe();

    // unsubscribe from the trades' stream
    __tradesSub?.unsubscribe();

    // Strategy Module
    try {
      await StrategyService.teardown();
    } catch (e) {
      console.error('StrategyService.teardown()', e);
    }

    // Balance Module
    try {
      await BalanceService.teardown();
    } catch (e) {
      console.error('BalanceService.teardown()', e);
    }

    // Trade Module
    try {
      await TradeService.teardown();
    } catch (e) {
      console.error('TradeService.teardown()', e);
    }
  };

  /**
   * Initializes the Position Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    try {
      // Active Position
      __active = await getActivePositionRecord();
      if (__active) {
        __activeHist = await eventHistoryFactory(__active.id, 'position', '1d');
      }

      // Strategy Module
      try {
        await StrategyService.initialize();
      } catch (e) {
        throw new Error(`StrategyService.initialize() -> ${extractMessage(e)}`);
      }

      // Balance Module
      try {
        await BalanceService.initialize();
      } catch (e) {
        throw new Error(`BalanceService.initialize() -> ${extractMessage(e)}`);
      }

      // Trade Module
      try {
        await TradeService.initialize(__active?.open);
      } catch (e) {
        throw new Error(`TradeService.initialize() -> ${extractMessage(e)}`);
      }

      // subscribe to the market state's stream
      __marketStateSub = MarketStateService.subscribe(__onMarketStateChanges);

      // subscribe to the trades' stream
      __tradesSub = TradeService.subscribe(__onTradesChanges);
    } catch (e) {
      await teardown();
      throw e;
    }
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // retrievers
    getPosition,
    listCompactPositions,
    listCompactPositionsByRange,
    getPositionHistory,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const PositionService = positionServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  PositionService,
};
