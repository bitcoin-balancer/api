import { invokeFuncPersistently } from '../shared/utils/index.js';
import { APIErrorService } from '../api-error/index.js';
import { ExchangeService, IBalances } from '../shared/exchange/index.js';
import { IBalanceService } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Balance Service Factory
 * Generates the object in charge of retrieving and syncing the account's balances for both, the
 * base and quote assets.
 * @returns IBalanceService
 */
const balanceServiceFactory = (): IBalanceService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the current state of the account balances
  let __balances: IBalances;

  // the balances will be re-fetched every __REFETCH_FREQUENCY seconds
  const __REFETCH_FREQUENCY = 180; // ~3 minutes
  let __refetchInterval: NodeJS.Timeout;





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Retrieves the balances object from the local state. If forceRefetch is true, it will update
   * the state before returning it.
   * @param forceRefetch
   * @returns Promise<IBalances>
   */
  const getBalances = async (forceRefetch?: boolean): Promise<IBalances> => {
    if (forceRefetch) {
      __balances = await invokeFuncPersistently(ExchangeService.getBalances, undefined, [2, 3, 5]);
    }
    return __balances;
  };





  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Position Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    __refetchInterval = setInterval(async () => {
      try {
        await getBalances(true);
      } catch (e) {
        APIErrorService.save('BalanceService.__refetchInterval', e);
      }
    }, __REFETCH_FREQUENCY * 1000);
  };

  /**
   * Tears down the Position Module.
   * @returns Promise<void>
   */
  const teardown = async (): Promise<void> => {
    clearInterval(__refetchInterval);
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // retrievers
    getBalances,

    // initializer
    initialize,
    teardown,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const BalanceService = balanceServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  BalanceService,
};
