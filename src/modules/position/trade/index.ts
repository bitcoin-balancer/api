import { BehaviorSubject, Subscription } from 'rxjs';
import { invokeFuncPersistently } from '../../shared/utils/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService, ITrade } from '../../shared/exchange/index.js';
import { getSyncFrequency } from './utils.js';
import {
  listTradeRecords,
  getLastTradeRecordTime,
  saveTradeRecords,
} from './model.js';
import { ITradeService } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Trade Service Factory
 * Generates the object in charge of retrieving and storing the account trades triggered by
 * positions.
 * @returns ITradeService
 */
const tradeServiceFactory = (): ITradeService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the stream of trades that belong to the active position
  const __stream = new BehaviorSubject<ITrade[]>([]);

  // the balances will be re-fetched every __REFETCH_FREQUENCY seconds
  const __SYNC_FREQUENCY = getSyncFrequency();
  let __syncStartTime: number;
  let __syncInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  // ...





  /* **********************************************************************************************
   *                                            STREAM                                            *
   ********************************************************************************************** */

  /**
   * Generates a subscription to the trades' stream.
   * @param callback
   * @returns Subscription
   */
  const subscribe = (callback: (value: ITrade[]) => any): Subscription => (
    __stream.subscribe(callback)
  );





  /* **********************************************************************************************
   *                                             SYNC                                             *
   ********************************************************************************************** */

  /**
   * Retrieves account trades that have not yet been processed and returns them. If any, they are
   * stored in the database.
   * @param startTime
   * @returns Promise<ITrade[]>
   */
  const __getNewTrades = async (startTime: number): Promise<ITrade[]> => {
    const trades = await invokeFuncPersistently(
      ExchangeService.listTrades,
      [startTime],
      [2, 3, 7],
    );
    if (trades.length) {
      await saveTradeRecords(trades);
    }
    return trades;
  };

  /**
   * Initializes the trades' stream and keeps the local state synced with the exchange.
   * @param positionOpenTime
   * @returns Promise<void>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13505: if the response is not an array (binance)
   */
  const syncTrades = async (positionOpenTime?: number): Promise<void> => {
    // init values
    let trades: ITrade[] = __stream.value.slice();
    if (typeof positionOpenTime === 'number') {
      trades = await listTradeRecords(positionOpenTime);
    }

    // retrieve newer trades and store them (if any)
    const newTrades = await __getNewTrades(__syncStartTime);

    // broadcast the trades if there was a change
    const combined = [...trades, ...newTrades];
    if (combined.length > __stream.value.length) {
      __stream.next(combined);
      __syncStartTime = combined[combined.length - 1].event_time + 1;
    }
  };

  /**
   * Fires whenever a position is closed. It resets the stream and broadcasts it.
   */
  const onPositionClose = (): void => __stream.next([]);





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Trade Module.
   * @param positionOpenTime
   * @returns Promise<void>
   */
  const initialize = async (positionOpenTime: number | undefined): Promise<void> => {
    // set the starting point for the syncing process
    const lastTradeTime = await getLastTradeRecordTime();
    __syncStartTime = typeof lastTradeTime === 'number' ? lastTradeTime + 1 : Date.now();

    // sync the trades and initialize the interval
    await syncTrades(positionOpenTime);
    __syncInterval = setInterval(async () => {
      try {
        await syncTrades();
      } catch (e) {
        APIErrorService.save('TradeService.__syncInterval', e);
      }
    }, __SYNC_FREQUENCY * 1000);
  };

  /**
   * Tears down the Trade Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    clearInterval(__syncInterval);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // retrievers
    // ...

    // stream
    subscribe,
    onPositionClose,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const TradeService = tradeServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // service
  TradeService,

  // validations
  // ...

  // types
  // ...
};
