/* eslint-disable no-console */
import { Subscription } from 'rxjs';
import { IRecord } from '../../shared/types.js';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService } from '../../shared/exchange/index.js';
import { getOrderBookRefetchFrequency } from './utils.js';
import { IOrderBookService } from './types.js';
import { invokeFuncPersistently } from '../../shared/utils/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Order Book Service Factory
 * Generates the object in charge of keeping Balancer in sync with the base asset's order book and 
 * calculating its state.
 * @returns Promise<IOrderBookService>
 * @throws
 * - 12500: if the HTTP response code is not in the acceptedCodes
 * - 13502: if the order book object is invalid (binance)
 */
const orderBookServiceFactory = async (): Promise<IOrderBookService> => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the existing buy and sell orders
  let __asks: IRecord<number>;
  let __bids: IRecord<number>;

  // the identifier of the snapshot's state
  let __lastUpdateID: number;

  // the order book will be refetched every few seconds and will set the state anew
  const __REFETCH_FREQUENCY = getOrderBookRefetchFrequency();
  let __refetchInterval: NodeJS.Timeout;
  let __lastRefetch: number;

  // the subscription to the order book stream
  let __streamSub: Subscription;





  /* **********************************************************************************************
   *                                       SNAPSHOT FETCHER                                       *
   ********************************************************************************************** */

  /**
   * Fetches the order book and overrides the local state with the new data.
   * @returns Promise<void>
   */
  const fetchSnapshot = async (): Promise<void> => {
    const snapshot = await ExchangeService.getOrderBook();
    __asks = Object.fromEntries(snapshot.asks);
    __bids = Object.fromEntries(snapshot.bids);
    __lastUpdateID = snapshot.lastUpdateID;
    __lastRefetch = Date.now();
  };





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Starts the real-time connection with the order book.
   * @returns Promise<void>
   */
  const __on = async (): Promise<void> => {
    // fetch and sync the order book
    await invokeFuncPersistently(fetchSnapshot, undefined, [3, 5, 7]);

    // subscribe to the stream
    __streamSub = ExchangeService.getOrderBookStream().subscribe();

    // init the refetch interval
    __refetchInterval = setInterval(async () => {
      try {
        await fetchSnapshot();
      } catch (e) {
        console.error(e);
        APIErrorService.save('OrderBook.interval.refetch', e);
      }
    }, __REFETCH_FREQUENCY);
  };

  /**
   * Tears down the real-time connection with the order book.
   */
  const off = (): void => {
    if (__streamSub) {
      __streamSub.unsubscribe();
    }
    clearInterval(__refetchInterval);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  await __on();
  return Object.freeze({
    // properties
    // ...

    // initializer
    off,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  orderBookServiceFactory,
};
