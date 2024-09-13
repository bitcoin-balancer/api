/* eslint-disable no-console */
import { Subscription } from 'rxjs';
import { encodeError, extractMessage } from 'error-message-utils';
import { ITrade } from '../shared/exchange/index.js';
import { MarketStateService, IMarketState } from '../market-state/index.js';
import { StrategyService } from './strategy/index.js';
import { BalanceService } from './balance/index.js';
import { TradeService } from './trade/index.js';
import {
  canPositionRecordBeRetrieved,
  canCompactPositionRecordsBeListed,
} from './validations.js';
import {
  getPositionRecord,
  getActivePositionRecord,
  createPositionRecord,
  updatePositionRecord,
  listCompactPositionRecords,
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

  // the subscription to the market state's stream
  let __marketStateSub: Subscription;

  // the subscription to the trades' stream
  let __tradesSub: Subscription;





  /* **********************************************************************************************
   *                                           STREAMS                                            *
   ********************************************************************************************** */

  /**
   * Fires whenever a new market state is calculated.
   * @param nextState
   */
  const __onMarketStateChanges = (nextState: IMarketState): void => {

  };

  /**
   * Fires whenever the trades for an active position change in any way.
   * @param nextState
   */
  const __onTradesChanges = (nextState: ITrade[]): void => {

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
