import { BehaviorSubject } from 'rxjs';
import { invokeFuncPersistently } from '../../shared/utils/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService, IBalances, ITrade } from '../../shared/exchange/index.js';
import { getSyncFrequency } from './utils.js';
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
  let __syncInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves the balances object from the local state. If forceRefetch is true, it will update
   * the state before returning it.
   * @param forceRefetch
   * @returns Promise<IBalances>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13503: if the response didn't include a valid object (binance)
   * - 13504: if the response didn't include a valid list of balances (binance)
   * - 13750: if the balance for the base asset is not in the response object (binance)
   * - 13751: if the balance for the quote asset is not in the response object (binance)
   */
  const getBalances = async (forceRefetch?: boolean): Promise<IBalances> => {
    if (forceRefetch) {
      __balances = await invokeFuncPersistently(ExchangeService.getBalances, undefined, [2, 3, 5]);
    }
    return __balances;
  };





  /* **********************************************************************************************
   *                                             SYNC                                             *
   ********************************************************************************************** */

  const syncTrades = async (): Promise<void> => {

  };




  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Trade Module.
   * @param positionOpenTime
   * @returns Promise<void>
   */
  const initialize = async (positionOpenTime: number | undefined): Promise<void> => {
    await getBalances(true);
    __syncInterval = setInterval(async () => {
      try {
        await getBalances(true);
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
  TradeService,
};
