import { encodeError } from 'error-message-utils';
import { IRecordStore, recordStoreFactory } from '../../shared/record-store/index.js';
import { eventHistoryFactory, IEventHistory } from '../../candlestick/index.js';
import { NotificationService } from '../../notification/index.js';
import { ISplitStateID } from '../shared/types.js';
import { IWindowState } from '../window/index.js';
import { ICompactLiquidityState } from '../liquidity/index.js';
import { ICoinsStates, ISemiCompactCoinState } from '../coins/index.js';
import {
  buildPristinePriceCrashState,
  calculateDurations,
  toState,
  buildDefaultConfig,
} from './utils.js';
import {
  canRecordBeRetrieved,
  canRecordsBeListed,
  canConfigBeUpdated,
} from './validations.js';
import {
  getStateRecord,
  createStateRecord,
  listStateRecords,
} from './model.js';
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

  // the previously passed window state
  let __previousWindowState: IWindowState | undefined;

  // the current price crash state
  let __state: IPriceCrashStateRecord;

  // the time at which the state will be active until
  let __activeUntil: number | undefined;

  // the time at which another price crash state can be started
  let __idleUntil: number | undefined;

  // the instance of the history builder
  let __eventHist: IEventHistory;

  // the splits that will be used to calculate the points for the coins (both, quote and base)
  const __STATE_SPLITS: ISplitStateID[] = ['s25', 's15', 's10', 's5', 's2'];

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
  const __onPriceCrashState = async (): Promise<void> => {
    // init the state
    __state = buildPristinePriceCrashState();

    // calculate and set the durations
    const { activeUntil, idleUntil } = calculateDurations(
      __state.event_time,
      __config.value.crashDuration,
      __config.value.crashIdleDuration,
    );
    __activeUntil = activeUntil;
    __idleUntil = idleUntil;

    // intantiate the event history
    __eventHist = await eventHistoryFactory(__state.id, 'reversal', '5m');
  };

  /**
   * Invoked whenever there is an active crash state and the market state broadcasted new data.
   * @param windowState
   * @param liquidityState
   * @param coinsStates
   */
  const __onMarketStateChanges = (
    windowState: IWindowState,
    liquidityState: ICompactLiquidityState,
    coinsStates: ICoinsStates<ISemiCompactCoinState>,
  ): void => {

  };

  /**
   * Invoked whenever the price crash state is no longer active. It stores the state and completes
   * the event history.
   * @returns Promise<void>
   */
  const __onPriceCrashStateEnd = async (): Promise<void> => {
    // save the state
    await createStateRecord(__state);

    // reset the duration
    __activeUntil = undefined;

    // complete the event history instance
    await __eventHist.complete();
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


    // store the window state in memory
    __previousWindowState = windowState;

    // finally, return the state (if any)
    return (__state && __activeUntil !== undefined) ? toState(__state) : undefined;
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
      throw new Error(encodeError(`The record for ID '${id}' was not found in the database.`, 24000));
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
  const teardown = async (): Promise<void> => {

  };





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
