/* eslint-disable no-console */
import { Subscription } from 'rxjs';
import { IRecord } from '../../shared/types.js';
import { invokeFuncPersistently } from '../../shared/utils/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService, IOrderBookWebSocketMessage } from '../../shared/exchange/index.js';
import { getOrderBookRefetchFrequency } from './utils.js';
import { ILiquidityPriceRange, ILiquiditySide, ILiquiditySideID, IOrderBookService } from './types.js';

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
   *                                          RETRIEVER                                           *
   ********************************************************************************************** */

  const getSides = (
    range: ILiquidityPriceRange,
  ): { asks: ILiquiditySide, bids: ILiquiditySide } => {

  };





  /* **********************************************************************************************
   *                                       SYNCHRONIZATION                                        *
   ********************************************************************************************** */

  /**
   * Fetches the order book and overrides the local state with the new data.
   * @returns Promise<void>
   */
  const __fetchSnapshot = async (): Promise<void> => {
    const snapshot = await ExchangeService.getOrderBook();
    __asks = Object.fromEntries(snapshot.asks);
    __bids = Object.fromEntries(snapshot.bids);
    __lastUpdateID = snapshot.lastUpdateID;
    __lastRefetch = Date.now();
  };

  /**
   * Updates the list of orders for a side based on new data.
   * @param side
   * @param newOrders
   */
  const __syncOrders = (side: ILiquiditySideID, newOrders: Array<[number, number]>): void => {
    const orders = side === 'asks' ? __asks : __bids;
    newOrders.forEach(([price, newLiquidity]) => {
      if (newLiquidity === 0) {
        delete orders[price];
      } else {
        orders[price] = newLiquidity;
      }
    });
  };

  /**
   * Fires whenever a change of any kind takes place in the order book. It processes the new data
   * if the event took place after the current snapshot was fetched.
   * @param msg
   */
  const __onOrderBookChanges = (msg: IOrderBookWebSocketMessage): void => {
    if (msg.finalUpdateID > __lastUpdateID) {
      __syncOrders('asks', msg.asks);
      __syncOrders('bids', msg.bids);
    }
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
    await invokeFuncPersistently(__fetchSnapshot, undefined, [3, 5, 7]);

    // subscribe to the stream
    __streamSub = ExchangeService.getOrderBookStream().subscribe(__onOrderBookChanges);

    // init the refetch interval
    __refetchInterval = setInterval(async () => {
      try {
        await __fetchSnapshot();
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
    get lastRefetch() {
      return __lastRefetch;
    },

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
