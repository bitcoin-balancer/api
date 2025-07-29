import { encodeError } from 'error-message-utils';
import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import {
  CandlestickService,
  eventHistoryFactory,
  IEventHistory,
  IEventHistoryRecord,
} from '../../shared/candlestick/index.js';
import { NotificationService } from '../../notification/index.js';
import { ISplitStateID } from '../shared/types.js';
import { IWindowState } from '../window/index.js';
import { ICompactLiquidityState } from '../liquidity/index.js';
import { ICoinsStates, ISemiCompactCoinState } from '../coins/index.js';
import {
  calculatePoints,
  buildPristinePriceCrashState,
  calculateCrashStateDuration,
  isNewPriceCrashState,
  hasPriceCrashStateEnded,
  isPriceCrashStateActive,
  toReversalState,
  buildDefaultConfig,
} from './utils.js';
import { canRecordBeRetrieved, canRecordsBeListed, canConfigBeUpdated } from './validations.js';
import { getStateRecord, createStateRecord, listStateRecords } from './model.js';
import {
  IReversalService,
  IPriceCrashStateRecord,
  IReversalState,
  IReversalConfig,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Reversal Service Factory
 * Generates the object in charge of evaluating if a price crash has the potential to reverse.
 * @returns IReversalService
 */
const reversalServiceFactory = (): IReversalService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the current price crash state
  let __state: IPriceCrashStateRecord;

  // the time at which the state will be active until
  let __activeUntil: number | undefined;

  // the instance of the history builder
  let __eventHist: IEventHistory;

  // the splits that will be used to calculate the points for the coins (both, quote and base)
  const __STATE_SPLITS: ISplitStateID[] = ['s15', 's10', 's5', 's2'];

  // the module's configuration
  let __config: IRecordStore<IReversalConfig>;

  /* **********************************************************************************************
   *                                       STATE CALCULATOR                                       *
   ********************************************************************************************** */

  /**
   * Invoked when a price crash state is detected. It initializes all the required properties to
   * manage the state and issue the reversal event (if any).
   * @returns Promise<void>
   */
  const __onNewPriceCrashState = async (): Promise<void> => {
    // init the state
    __state = buildPristinePriceCrashState();

    // calculate and set the duration of the state
    __activeUntil = calculateCrashStateDuration(__state.event_time, __config.value.crashDuration);

    // intantiate the event history
    __eventHist = await eventHistoryFactory(__state.id, 'reversal', '5m');
  };

  /**
   * Invoked whenever there is an active crash state and the market state broadcasted new data. It
   * calculates the current points broadcasts a reversal event if present.
   * @param currentTime
   * @param windowState
   * @param liquidityState
   * @param coinsStates
   */
  const __onMarketStateChanges = (
    currentTime: number,
    liquidityState: ICompactLiquidityState,
    coinsStates: ICoinsStates<ISemiCompactCoinState>,
  ): void => {
    // calculate the market state points
    const { total, liquidity, coinsQuote, coinsBase } = calculatePoints(
      liquidityState,
      coinsStates,
      __STATE_SPLITS,
      __config.value.weights,
    );

    // update the state
    __state.highest_points = total > __state.highest_points ? total : __state.highest_points;
    __state.final_points = total;

    // update the history
    __eventHist.handleNewData([total, liquidity, coinsQuote, coinsBase]);

    // if an event hasn't been issued, check if the current points meet the requirements. If so,
    // issue a reversal event.
    if (__state.reversal_event_time === null && total >= __config.value.pointsRequirement) {
      __state.reversal_event_time = currentTime;
      NotificationService.onReversalEvent(total);
    }
  };

  /**
   * Invoked whenever the price crash state is no longer active. It resets the state duration,
   * stores the state and completes the event history.
   * the event history.
   * @returns Promise<void>
   */
  const __onPriceCrashStateEnd = async (): Promise<void> => {
    // reset the duration
    __activeUntil = undefined;

    // save the state & complete the event history instance
    await Promise.all([createStateRecord(__state), __eventHist.complete()]);
  };

  /**
   * Calculates the current state of the reversal if there is a price crash active.
   * @param windowState
   * @param liquidityState
   * @param coinsStates
   * @returns IReversalState | undefined
   */
  const calculateState = (
    windowState: IWindowState,
    liquidityState: ICompactLiquidityState,
    coinsStates: ICoinsStates<ISemiCompactCoinState>,
  ): IReversalState | undefined => {
    // init the current time
    const ts = Date.now();

    // handle the new data based on the current state
    if (isNewPriceCrashState(windowState, __activeUntil)) {
      __onNewPriceCrashState();
    } else if (hasPriceCrashStateEnded(ts, __activeUntil, windowState.state)) {
      __onPriceCrashStateEnd();
    } else if (isPriceCrashStateActive(ts, __activeUntil, __state)) {
      __onMarketStateChanges(ts, liquidityState, coinsStates);
    }

    // finally, return the state (if any)
    return __state && __activeUntil !== undefined
      ? toReversalState(__state, __config.value.pointsRequirement)
      : undefined;
  };

  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves a price crash state record for an ID. If there is an active state, it will return it
   * straight from the local property.
   * @param id
   * @returns Promise<IPriceCrashStateRecord>
   * @throws
   * - 24509: if the ID is not a valid UUID v4
   * - 24000: if the record does not exist
   */
  const getRecord = async (id: string): Promise<IPriceCrashStateRecord> => {
    canRecordBeRetrieved(id);

    // check if the user is retrieving the active state. Otherwise, query the DB
    if (__state && __state.id === id) {
      return __state;
    }
    const record = await getStateRecord(id);
    if (!record) {
      throw new Error(
        encodeError(`The record for ID '${id}' was not found in the database.`, 24000),
      );
    }
    return record;
  };

  /**
   * Retrieves a list of price crash state records.
   * @param limit
   * @param startAtEventTime
   * @returns Promise<IPriceCrashStateRecord[]>
   * @throws
   * - 24510: if the desired number of records exceeds the limit
   * - 24511: if the startAtEventTime was provided and is invalid
   */
  const listRecords = async (
    limit: number,
    startAtEventTime: number | undefined,
  ): Promise<IPriceCrashStateRecord[]> => {
    canRecordsBeListed(limit, startAtEventTime);
    return listStateRecords(limit, startAtEventTime);
  };

  /**
   * Retrieves the history in OHLC format for a price crash state based on its ID.
   * @param id
   * @returns Promise<IEventHistoryRecord>
   * @throws
   * - 11000: if the id has an invalid format
   * - 11001: if the record was not found in the database
   */
  const getEventHistory = (id: string): Promise<IEventHistoryRecord> =>
    CandlestickService.getEventHistory(id);

  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Reversal Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    // initialize the configuration
    __config = await recordStoreFactory('REVERSAL', buildDefaultConfig());

    // ...
  };

  /**
   * Tears down the Reversal Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {};

  /* **********************************************************************************************
   *                                        CONFIGURATION                                         *
   ********************************************************************************************** */

  /**
   * Updates the configuration of the module.
   * @param newConfig
   * @throws
   * - 24500: if the new config is an invalid object
   * - 24501: if the crash duration is invalid
   * - 24502: if the crash idle duration is invalid
   * - 24503: if the points requirement is invalid
   * - 24504: if the weights property is an invalid object
   * - 24505: if the liquidity weight is invalid
   * - 24506: if the coins quote weight is invalid
   * - 24507: if the coins base weight is invalid
   * - 24508: if adding the weights doesn't result in 100
   */
  const updateConfiguration = async (newConfig: IReversalConfig): Promise<void> => {
    canConfigBeUpdated(newConfig);
    await __config.update(newConfig);
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
    calculateState,

    // retrievers
    getRecord,
    listRecords,
    getEventHistory,

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
const ReversalService = reversalServiceFactory();

/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  ReversalService,

  // types
  type IPriceCrashStateRecord,
  type IReversalState,
};
