/* eslint-disable no-console */
import { Subscription } from 'rxjs';
import { encodeError, extractMessage } from 'error-message-utils';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { APIErrorService } from '../api-error/index.js';
import { NotificationService } from '../notification/index.js';
import {
  CandlestickService,
  eventHistoryFactory,
  IEventHistory,
  IEventHistoryRecord,
} from '../shared/candlestick/index.js';
import { IBalances, ITrade } from '../shared/exchange/index.js';
import { IState } from '../market-state/shared/types.js';
import { MarketStateService, IMarketState } from '../market-state/index.js';
import { StrategyService, IDecreaseLevelID } from './strategy/index.js';
import { BalanceService } from './balance/index.js';
import { TradeService } from './trade/index.js';
import { TransactionService } from './transaction/index.js';
import {
  processTXAmount,
  toQuoteAsset,
  toBaseAsset,
  calculateDecreaseAmount,
  calculateMarketStateDependantProps,
  analyzeTrades,
  buildNewPosition,
  buildPositionAction,
  toCompact,
  getBalances,
} from './utils.js';
import {
  canPositionBeDecreased,
  canPositionBeArchived,
  canPositionBeUnarchived,
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
  ITradesAnalysis,
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

  // asset symbols
  const __BASE_ASSET = ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset;
  const __QUOTE_ASSET = ENVIRONMENT.EXCHANGE_CONFIGURATION.quoteAsset;

  // the number of decimal places the base asset can have
  const __BASE_ASSET_DP = 4;

  // the minimum amount of the base asset that can bought or sold
  const __MIN_ORDER_SIZE = 0.0002;

  // the active position (if any)
  let __active: IPosition | undefined;
  let __activeHist: IEventHistory | undefined;

  // the subscription to the market state's stream
  let __price: number;
  let __windowState: IState;
  let __lastReversalEventTime: number = 0;
  let __marketStateSub: Subscription;

  // the subscription to the trades' stream
  let __rawTrades: ITrade[] = [];
  let __trades: ITradesAnalysis | undefined;
  let __tradesSub: Subscription;





  /* **********************************************************************************************
   *                                       GENERAL HELPERS                                        *
   ********************************************************************************************** */

  /**
   * Invoked whenever an active position changes, keeping the current values in sync with the
   * history.
   */
  const __updatePositionHistory = (): void => {
    __activeHist?.handleNewData([__price, __active!.gain, __active!.entry_price, __active!.amount]);
  };





  /* **********************************************************************************************
   *                                     INCREASE TRANSACTION                                     *
   ********************************************************************************************** */

  /**
   * Calculates the amount that will be increased. If 0 is returned, abort the transaction.
   * @param balances
   * @returns number
   */
  const __calculateIncreaseAmount = (balances: IBalances): number => {
    // init the quote asset balance
    const balance = balances[__QUOTE_ASSET]!;

    // if there is enough balance, increase the pre-configured amount
    if (balance >= StrategyService.config.increaseAmountQuote) {
      return toBaseAsset(StrategyService.config.increaseAmountQuote, __price, __BASE_ASSET_DP);
    }

    // if there isn't enough balance to cover the requirement but enough to transact, do so
    if (balance >= toQuoteAsset(__MIN_ORDER_SIZE, __price)) {
      NotificationService.lowBalance('BUY', balance, StrategyService.config.increaseAmountQuote);
      return toBaseAsset(balance, __price, __BASE_ASSET_DP);
    }

    // otherwise, the position cannot be opened or increased
    NotificationService.insufficientBalance('BUY', balance, StrategyService.config.increaseAmountQuote);
    return 0;
  };

  /**
   * Opens or increases an existing position based on the strategy.
   * @returns Promise<void>
   */
  const __increase = async (): Promise<void> => {
    try {
      // retrieve the balances
      const balances = await getBalances();

      // calculate the tx amount and proceed if requirements are met
      const amount = __calculateIncreaseAmount(balances);
      if (amount > 0) {
        // initialize the tx and update the position (if any)
        const txID = await TransactionService.buy(amount, balances);
        if (__active) {
          __active.increase_actions.push(buildPositionAction(
            txID,
            StrategyService.config.increaseIdleDuration * 60,
          ));
          await updatePositionRecord(__active);
        }
      }
    } catch (e) {
      const msg = extractMessage(e);
      APIErrorService.save('PositionService.__increase', msg);
      NotificationService.failedToInitializeTransaction(msg);
    }
  };





  /* **********************************************************************************************
   *                                     DECREASE TRANSACTION                                     *
   ********************************************************************************************** */

  /**
   * Calculates the amount that will be decreased from a position. If 0 is returned, abort the
   * transaction.
   * @param percentage
   * @param balances
   * @returns number
   * @throws
   * - if there isn't an active position by the time this func is invoked
   */
  const __calculateDecreaseAmount = (percentage: number, balances: IBalances): number => {
    // only active positions can be decreased
    if (__active === undefined) {
      throw new Error('Unable to decrease a position that is not active.');
    }

    // init values
    const balance = balances[__BASE_ASSET]!;

    // only proceed if there is enough balance to transact
    if (balance >= __MIN_ORDER_SIZE) {
      // if the amount is smaller than or equals to the min. amount quote, close the position
      if (__active.amount_quote <= StrategyService.config.minPositionAmountQuote) {
        if (__active.amount > balance) {
          NotificationService.lowBalance('SELL', balance, __active.amount);
          return processTXAmount(balance, __BASE_ASSET_DP);
        }
        return processTXAmount(__active.amount, __BASE_ASSET_DP);
      }

      // calculate the amount that will be decreased
      const decreaseAmount = calculateDecreaseAmount(__active.amount, percentage, __MIN_ORDER_SIZE);

      // if the amount is larger than the balance, reduce whatever is in the account
      if (decreaseAmount.isGreaterThan(balance)) {
        NotificationService.lowBalance('SELL', balance, decreaseAmount.toNumber());
        return processTXAmount(balance, __BASE_ASSET_DP);
      }

      // if the decrease amount leaves a residue that is smaller than the minimum order size, close
      // the position
      const adjustedAmount = decreaseAmount.plus(__MIN_ORDER_SIZE);
      if (adjustedAmount.isGreaterThanOrEqualTo(__active.amount)) {
        // if the position amount is larger than the balance, decrease whatever is there
        if (__active.amount > balance) {
          NotificationService.lowBalance('SELL', balance, __active.amount);
          return processTXAmount(balance, __BASE_ASSET_DP);
        }
        return processTXAmount(__active.amount, __BASE_ASSET_DP);
      }

      // otherwise, decrease the calculated amount
      return processTXAmount(decreaseAmount, __BASE_ASSET_DP);
    }
    NotificationService.insufficientBalance('SELL', balance, __MIN_ORDER_SIZE);
    return 0;
  };

  /**
   * Decreases an existing position based on the strategy.
   * @param percentage
   * @param activeLevel?
   * @returns Promise<void>
   */
  const __decrease = async (percentage: number, activeLevel?: IDecreaseLevelID): Promise<void> => {
    try {
      // retrieve the balances
      const balances = await getBalances();

      // calculate the tx amount and proceed if requirements are met
      const amount = __calculateDecreaseAmount(percentage, balances);
      if (amount > 0) {
        // initialize the tx and update the position (if any)
        const txID = await TransactionService.sell(amount, balances);
        if (typeof activeLevel === 'number') {
          __active!.decrease_actions[activeLevel].push(buildPositionAction(
            txID,
            StrategyService.config.decreaseLevels[activeLevel].frequency,
          ));
          await updatePositionRecord(__active!);
        }
      }
    } catch (e) {
      const msg = extractMessage(e);
      APIErrorService.save('PositionService.__decrease', msg);
      NotificationService.failedToInitializeTransaction(msg);
    }
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
   * Fires whenever a new reversal event is issued. It checks if a position should be opened. If
   * there is an active position, it checks if the idle state has faded away and increases it if so.
   * @returns Promise<void>
   */
  const __handleNewReversalEvent = async (): Promise<void> => {
    if (
      StrategyService.config.canIncrease
      && (
        !__active
        // eslint-disable-next-line max-len
        || Date.now() > __active.increase_actions[__active.increase_actions.length - 1].nextEventTime
      )
    ) {
      await __increase();
    }
  };

  /**
   * Fires whenever the market is increasing strongly. It checks if there is an active position and
   * if it should be decreased.
   * @returns Promise<void>
   */
  const __handleStronglyIncreasingWindow = async (): Promise<void> => {
    if (StrategyService.config.canDecrease && __active) {
      const lvl = StrategyService.getActiveDecreaseLevel(__active.gain);
      if (
        lvl !== undefined
        && (
          __active.decrease_actions[lvl].length === 0
          // eslint-disable-next-line max-len
          || Date.now() > __active.decrease_actions[lvl][__active.decrease_actions[lvl].length - 1].nextEventTime
        )
      ) {
        await __decrease(StrategyService.config.decreaseLevels[lvl].percentage, lvl);
      }
    }
  };





  /* **********************************************************************************************
   *                                    TRADES EVENT HANDLERS                                     *
   ********************************************************************************************** */

  /**
   * Fires when the module has just been initialized or when a new position has just come into
   * existance. If the position already exists, it will update its values. Otherwise, it creates the
   * record.
   * @returns Promise<void>
   */
  const __handleNewPosition = async (): Promise<void> => {
    // if there was an existing active position, update its properties. Otherwise, build the new
    // position record and save it.
    if (__active) {
      __active = {
        ...__active,
        ...calculateMarketStateDependantProps(
          __price,
          __active.entry_price,
          __active.amount,
          __active.amount_quote_in,
          __active.amount_quote_out,
        ),
        ...__trades,
      };
      await updatePositionRecord(__active);
    } else {
      __active = await buildNewPosition(
        __trades!,
        __price,
        StrategyService.config.increaseIdleDuration,
      );
      await createPositionRecord(__active);
      NotificationService.onNewPosition(__active.amount, __active.amount_quote, __price);
    }

    // initialize the history
    __activeHist = await eventHistoryFactory(__active.id, 'position', '1d');
    __updatePositionHistory();
  };

  /**
   * Fires whenever an active position has changed and now has an amount equals to 0. When this
   * happens, the last state of the position is calculated and stored before unsetting it.
   * @returns Promise<void>
   */
  const __handlePositionChanges = async (): Promise<void> => {
    // update the record
    __active = {
      ...__active!,
      ...calculateMarketStateDependantProps(
        __price,
        __active!.entry_price,
        __active!.amount,
        __active!.amount_quote_in,
        __active!.amount_quote_out,
      ),
      ...__trades,
    };
    await updatePositionRecord(__active!);

    // update the history
    __updatePositionHistory();

    // check if the position has been closed
    if (__active.amount < __MIN_ORDER_SIZE) {
      // notify users
      NotificationService.onPositionClose(__active.open, __active.pnl, __active.roi);

      // reset the trades' stream
      TradeService.onPositionClose();

      // complete the event history
      __activeHist!.complete();

      // reset the local properties
      __active = undefined;
      __activeHist = undefined;
      __trades = undefined;
    }
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
    if (
      nextState.reversalState !== undefined
      && typeof nextState.reversalState.reversalEventTime === 'number'
      && nextState.reversalState.reversalEventTime > __lastReversalEventTime
    ) {
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
   * position has been opened or if the active position has changed. If so, it handles the
   * appropriate event.
   * @param nextState
   */
  const __onTradesChanges = (nextState: ITrade[]): void => {
    __rawTrades = nextState;
    const newAnalysis = analyzeTrades(__rawTrades, __price, StrategyService.config.decreaseLevels);
    if (__trades === undefined && newAnalysis !== undefined) {
      __trades = newAnalysis;
      __handleNewPosition();
    } else if (
      __trades !== undefined
      && newAnalysis !== undefined
      && __trades.amount !== newAnalysis.amount
    ) {
      __trades = newAnalysis;
      __handlePositionChanges();
    }
  };





  /* **********************************************************************************************
   *                                           ACTIONS                                            *
   ********************************************************************************************** */

  /**
   * Opens or increases a position.
   * @returns Promise<void>
   */
  const increasePosition = (): Promise<void> => __increase();

  /**
   * Validates and attempts to decrease an active position.
   * @param percentage
   * @returns Promise<void>
   * @throws
   * - 30507: if there isn't an active position
   * - 30508: if the percentage is not a valid number
   */
  const decreasePosition = (percentage: number): Promise<void> => {
    canPositionBeDecreased(__active, percentage);
    return __decrease(percentage);
  };

  /**
   * Archives a position by its ID.
   * @param id
   * @returns Promise<void>
   * @throws
   * - 30500: if the ID is not a valid uuid v4
   * - 30509: if the positon doesn't exist
   * - 30510: if the positon has already been archived
   */
  const archivePosition = async (id: string): Promise<void> => {
    canPositionRecordBeRetrieved(id);
    const record = await getPositionRecord(id);
    canPositionBeArchived(id, record);
    record!.archived = true;
    await updatePositionRecord(record!);
  };

  /**
   * Unarchives a position by its ID.
   * @param id
   * @returns Promise<void>
   * @throws
   * - 30500: if the ID is not a valid uuid v4
   * - 30509: if the positon doesn't exist
   * - 30511: if the positon is not archived
   */
  const unarchivePosition = async (id: string): Promise<void> => {
    canPositionRecordBeRetrieved(id);
    const record = await getPositionRecord(id);
    canPositionBeUnarchived(id, record);
    record!.archived = false;
    await updatePositionRecord(record!);
  };





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves the compact position object if there is an active one.
   * @returns ICompactPosition | undefined
   */
  const getActive = (): ICompactPosition | undefined => (
    __active === undefined ? undefined : toCompact(__active)
  );

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
   * @param endAt
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
   * Retrieves the history in OHLC format for a position.
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

    // actions
    increasePosition,
    decreasePosition,
    archivePosition,
    unarchivePosition,

    // retrievers
    getActive,
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
  // service
  PositionService,

  // types
  type IPosition,
  type ICompactPosition,
};
