import ms from 'ms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { sortRecords, retryAsyncFunction } from 'web-utils-kit';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService, ITrade } from '../../shared/exchange/index.js';
import { getSyncFrequency, toTradeRecord } from './utils.js';
import { validateTradeRecordID, validateManualTradeRecord } from './validations.js';
import {
  getTradeRecord,
  listTradeRecords,
  getLastTradeRecordTime,
  saveTradeRecords,
  createTradeRecord,
  updateTradeRecord,
  deleteTradeRecord,
} from './model.js';
import { ITradeService, IManualTrade } from './types.js';

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
   * When using Balancer, the user is able to execute trades independently through the Exchange's
   * platform or another service. For the platform to be able to manage the metrics correctly, some
   * rules have to be followed:
   * - for a position to be opened, the first trade must be a 'BUY' transaction
   * @param trades
   * @returns ITrade[]
   */
  const __filterTrades = (trades: ITrade[]): ITrade[] => {
    if (
      __stream.value.length === 0
      && trades.length > 0
      && trades[0].side === 'SELL'
    ) {
      return __filterTrades(trades.slice(1));
    }
    return trades;
  };

  /**
   * Retrieves account trades that have not yet been processed and returns them. If any, they are
   * stored in the database and their ID id inserted into the object.
   * @param startTime
   * @returns Promise<ITrade[]>
   */
  const __getNewTrades = async (startTime: number): Promise<ITrade[]> => {
    const trades = await retryAsyncFunction(
      () => ExchangeService.listTrades(startTime),
      [2, 3, 7],
    );
    let filtered = __filterTrades(trades);
    if (filtered.length) {
      const ids = await saveTradeRecords(filtered);
      filtered = filtered.map((trade, i) => ({ ...trade, id: ids[i] }));
    }
    return filtered;
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
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves a trade record. Returns undefined if the record is not found.
   * @param id
   * @returns Promise<ITrade | undefined>
   */
  const getTrade = getTradeRecord;

  /**
   * Retrieves a list of trades from the database based on a given range.
   * @param startAt
   * @param endAt?
   * @returns Promise<ITrade[]>
   */
  const listTrades = listTradeRecords;





  /* **********************************************************************************************
   *                                           ACTIONS                                            *
   ********************************************************************************************** */

  /**
   * Inserts a trade that was manually created into the database.
   * @param trade
   * @returns Promise<number>
   */
  const createTrade = async (trade: ITrade): Promise<number> => {
    const id = await createTradeRecord(trade);
    __stream.next([...__stream.value, { ...trade, id }].sort(sortRecords('event_time', 'asc')));
    return id;
  };

  /**
   * Updates a trade that was manually created.
   * @param trade
   * @returns Promise<void>
   */
  const updateTrade = async (trade: ITrade): Promise<void> => {
    await updateTradeRecord(trade);
    __stream.next(
      __stream.value.map((record) => {
        if (record.id === trade.id) {
          return trade;
        }
        return record;
      }).sort(sortRecords('event_time', 'asc')),
    );
  };

  /**
   * Deletes a trade record that was manually created from the database.
   * @param id
   * @returns Promise<void>
   */
  const deleteTrade = async (id: number): Promise<void> => {
    await deleteTradeRecord(id);
    __stream.next(__stream.value.filter((trade) => trade.id !== id));
  };





  /* **********************************************************************************************
   *                                           HELPERS                                            *
   ********************************************************************************************** */

  /**
   * Converts a manual trade into a full trade object.
   * @param trade
   * @param id?
   * @returns ITrade
   */
  const toTrade = toTradeRecord;

  /**
   * Validates the identifier for a record.
   * @param id
   * @throws
   * - 33507: if the record's ID has an invalid format
   */
  const validateTradeID = validateTradeRecordID;

  /**
   * Ensures a manual trades contains all the required properties with valid values.
   * @param record
   * @throws
   * - 33500: if the record is not an object
   * - 33501: if the event_time is an invalid
   * - 33502: if the timestamp is set ahead of time
   * - 33503: if the side of the record is invalid
   * - 33504: if the notes are invalid
   * - 33505: if the price is invalid
   * - 33506: if the amount is invalid
   */
  const validateManualTrade = validateManualTradeRecord;





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
    }, ms(`${__SYNC_FREQUENCY} seconds`));
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

    // stream
    subscribe,
    onPositionClose,

    // retrievers
    getTrade,
    listTrades,

    // actions
    createTrade,
    updateTrade,
    deleteTrade,

    // helpers
    toTrade,
    validateTradeID,
    validateManualTrade,

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

  // types
  type IManualTrade,
};
