/* eslint-disable no-console */
import ms from 'ms';
import { Subscription } from 'rxjs';
import { retryAsyncFunction } from 'web-utils-kit';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService, IOrderBookWebSocketMessage } from '../../shared/exchange/index.js';
import {
  getOrderBookRefetchFrequency,
  isOrderPriceInRange,
  priceLevelSortFunc,
} from './utils.js';
import {
  ILiquidityPriceLevel,
  ILiquidityPriceRange,
  ILiquiditySide,
  ILiquiditySideID,
  IOrderBookService,
} from './types.js';

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
  let __asks: Record<string, number>;
  let __bids: Record<string, number>;

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

  /**
   * Builds the order tuple based on its price and liquidity.
   * @param price
   * @param liquidity
   * @returns [number, number]
   */
  const __buildOrder = (price: string, liquidity: number): [number, number] => (
    [Math.floor(Number(price)), liquidity]
  );

  /**
   * Builds and sorts the order tuples by price ascendingly.
   * @param side
   * @returns Array<[number, number]>
   */
  const __getOrdersForSide = (side: ILiquiditySideID): Array<[number, number]> => {
    const orders = side === 'asks' ? __asks : __bids;
    return Object.keys(orders)
      .map((price) => __buildOrder(price, orders[price]))
      .sort((a, b) => a[0] - b[0]);
  };

  /**
   * Builds the price levels and calculates the total liquidity for a side.
   * @param side
   * @param range
   * @returns ILiquiditySide
   */
  const __buildSide = (side: ILiquiditySideID, range: ILiquidityPriceRange): ILiquiditySide => {
    // init values
    let total: number = 0;
    const levels: ILiquidityPriceLevel[] = [];

    // iterate over each order and ensure the price level is within the range
    __getOrdersForSide(side).forEach(([price, liquidity]) => {
      if (isOrderPriceInRange(price, range, side)) {
        // if there are levels, otherwise include it
        if (levels.length > 0) {
          // if the price has not yet been added, do so. Otherwise, just increase the liquidity
          if (levels[levels.length - 1][0] !== price) {
            levels.push([price, liquidity, 0]);
          } else {
            levels[levels.length - 1][1] += liquidity;
          }
        } else {
          levels.push([price, liquidity, 0]);
        }

        // add the liquidity to the total
        total += liquidity;
      }
    });

    // finally, return the build
    return { total, levels: levels.sort(priceLevelSortFunc(side)) };
  };


  /**
   * Builds the liquidity for both sides based on the existing orders. Note that the intensities
   * are not calculated at this stage.
   * @param range
   * @returns { asks: ILiquiditySide, bids: ILiquiditySide }
   */
  const getPreProcessedLiquiditySides = (
    range: ILiquidityPriceRange,
  ): { asks: ILiquiditySide, bids: ILiquiditySide } => ({
    asks: __buildSide('asks', range),
    bids: __buildSide('bids', range),
  });





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
    await retryAsyncFunction(__fetchSnapshot, undefined, [3, 5, 7]);

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
    }, ms(`${__REFETCH_FREQUENCY} seconds`));
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

    // retriever
    getPreProcessedLiquiditySides,

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
