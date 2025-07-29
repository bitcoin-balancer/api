import ms from 'ms';
import { retryAsyncFunction } from 'web-utils-kit';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService, IBalances } from '../../shared/exchange/index.js';
import { getRefetchFrequency } from './utils.js';
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

  // the number of seconds Balancer will wait before attempting to refetch the balances on error
  const __DELAYS = [2, 3, 7, 10];

  // the balances will be re-fetched every __REFETCH_FREQUENCY seconds
  const __REFETCH_FREQUENCY = getRefetchFrequency();
  let __refetchInterval: NodeJS.Timeout;

  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  /**
   * Fetches the current balances, updates the local state and returns them.
   * @returns Promise<IBalances>
   * @throws
   * - 12500: if the HTTP response code is not in the acceptedCodes
   * - 13503: if the response didn't include a valid object (binance)
   * - 13504: if the response didn't include a valid list of balances (binance)
   * - 13750: if the balance for the base asset is not in the response object (binance)
   * - 13751: if the balance for the quote asset is not in the response object (binance)
   */
  const getBalances = async (): Promise<IBalances> => {
    __balances = await retryAsyncFunction(() => ExchangeService.getBalances(), __DELAYS);
    return __balances;
  };

  /* **********************************************************************************************
   *                                         INITIALIZER                                          *
   ********************************************************************************************** */

  /**
   * Initializes the Balance Module.
   * @returns Promise<void>
   */
  const initialize = async (): Promise<void> => {
    await getBalances();
    __refetchInterval = setInterval(
      async () => {
        try {
          await getBalances();
        } catch (e) {
          APIErrorService.save('BalanceService.__refetchInterval', e);
        }
      },
      ms(`${__REFETCH_FREQUENCY} seconds`),
    );
  };

  /**
   * Tears down the Balance Module.
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
    get balances() {
      return __balances;
    },

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
export { BalanceService };
