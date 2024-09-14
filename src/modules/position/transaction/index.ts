import { extractMessage } from 'error-message-utils';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { delay } from '../../shared/utils/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { ExchangeService, IBalances, ISide } from '../../shared/exchange/index.js';
import { BalanceService } from '../balance/index.js';
import {
  buildLog,
  buildTX,
  getInitialBalancesSnapshot,
} from './utils.js';
import {
  createTransactionRecord,
  updateTransactionRecord,
} from './model.js';
import {
  ITransactionService,
  ITransactionLog,
  ITransaction,
  ITransactionActionResult,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Transaction Service Factory
 * Generates the object in charge of ensuring that position actions get executed properly.
 * @returns ITransactionService
 */
const transactionServiceFactory = (): ITransactionService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the base asset's symbol
  const __BASE_ASSET = ENVIRONMENT.EXCHANGE_CONFIGURATION.baseAsset;

  // the delays that will be awaited before trying to execute the action again
  const __RETRY_DELAYS: number[] = [5, 15, 30, 60, 180];

  // the number of seconds Balancer will wait before confirming the tx
  const __TX_CONFIRMATION_DELAY = 10;





  /* **********************************************************************************************
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  // ...





  /* **********************************************************************************************
   *                                           EXECUTION                                          *
   ********************************************************************************************** */

  /**
   * Attempts to retrieve the initial balances in a persistent manner.
   * @param logs?
   * @param retryScheduleDuration?
   * @returns Promise<ITransactionActionResult>
   */
  const __getInitialBalances = async (
    logs: ITransactionLog[] = [],
    retryScheduleDuration: number[] = __RETRY_DELAYS,
  ): Promise<ITransactionActionResult> => {
    try {
      const balances = await BalanceService.getBalances(true);
      return { logs: [...logs, buildLog('INITIAL_BALANCES', true, balances)] };
    } catch (e) {
      const msg = extractMessage(e);
      if (retryScheduleDuration.length === 0) {
        return { logs: [...logs, buildLog('INITIAL_BALANCES', false, undefined, msg)], error: msg };
      }
      await delay(retryScheduleDuration[0]);
      return __getInitialBalances(
        [...logs, buildLog('INITIAL_BALANCES', false, undefined, msg)],
        retryScheduleDuration.slice(1),
      );
    }
  };

  /**
   * Executes the transaction and returns the log based on the outcome.
   * Important: the outcome of executing transactions cannot be trusted as they must be confirmed
   * against the actual balance.
   * @param side
   * @param amount
   * @returns Promise<ITransactionLog>
   */
  const __executeTransaction = async (side: ISide, amount: number): Promise<ITransactionLog> => {
    try {
      let payload: Record<string, unknown>;
      if (side === 'BUY') {
        payload = await ExchangeService.buy(amount);
      } else {
        payload = await ExchangeService.sell(amount);
      }
      return buildLog('EXECUTION', true, payload);
    } catch (e) {
      return buildLog('EXECUTION', false, undefined, e);
    }
  };

  /**
   * Retrieves the balance from the Exchange to verify if the transaction took place.
   * @param initialBalances
   * @param logs?
   * @param retryScheduleDuration?
   * @returns Promise<ITransactionActionResult>
   */
  const __confirmTransaction = async (
    initialBalances: IBalances,
    logs: ITransactionLog[] = [],
    retryScheduleDuration: number[] = __RETRY_DELAYS,
  ): Promise<ITransactionActionResult> => {
    try {
      // retrieve the balances
      const balances = await BalanceService.getBalances(true);

      // confirm the tx took place
      if (initialBalances[__BASE_ASSET] !== balances[__BASE_ASSET]) {
        return { logs: [...logs, buildLog('CONFIRMATION', true, balances)] };
      }
      const msg = 'The balance did not change after the transaction request was sent to the Exchange.';
      return { logs: [...logs, buildLog('CONFIRMATION', false, balances, msg)], error: msg };
    } catch (e) {
      const msg = extractMessage(e);
      if (retryScheduleDuration.length === 0) {
        return { logs: [...logs, buildLog('CONFIRMATION', false, undefined, msg)], error: msg };
      }
      await delay(retryScheduleDuration[0]);
      return __confirmTransaction(
        initialBalances,
        [...logs, buildLog('CONFIRMATION', false, undefined, msg)],
        retryScheduleDuration.slice(1),
      );
    }
  };

  /**
   * Executes and confirms the transaction took place and the balance was affected.
   * @param side
   * @param amount
   * @param initialBalances
   * @param logs?
   * @param retryScheduleDuration?
   * @returns Promise<ITransactionActionResult>
   */
  const __executeAndConfirmTransaction = async (
    side: ISide,
    amount: number,
    initialBalances: IBalances,
    logs: ITransactionLog[] = [],
    retryScheduleDuration: number[] = __RETRY_DELAYS,
  ): Promise<ITransactionActionResult> => {
    // execute the tx and activate the delay
    const txExecutionLog = await __executeTransaction(side, amount);
    await delay(__TX_CONFIRMATION_DELAY);

    // confirm the tx against the current balance
    const txConfirmation = await __confirmTransaction(initialBalances);

    // combine the logs
    const combined: ITransactionLog[] = [...logs, txExecutionLog, ...txConfirmation.logs];

    // if successful, return the logs. Otherwise, try again
    if (txConfirmation.error === undefined) {
      return { logs: combined };
    }
    if (retryScheduleDuration.length === 0) {
      return { logs: combined, error: txConfirmation.error };
    }
    return __executeAndConfirmTransaction(
      side,
      amount,
      initialBalances,
      combined,
      retryScheduleDuration.slice(1),
    );
  };

  /**
   * Schedules a transaction to be executed persistently.
   * @param id
   * @param rawTX
   * @returns Promise<void>
   */
  const __scheduleTransaction = async (
    id: number,
    rawTX: Omit<ITransaction, 'id'>,
  ): Promise<void> => {
    const tx = { ...rawTX, id };
    try {
      // retrieve the initial balances in case they weren't provided
      if (tx.logs.length === 0) {
        const { logs, error } = await __getInitialBalances();
        tx.logs = [...tx.logs, ...logs];
        if (typeof error === 'string') {
          throw new Error(
            'Failed to retrieve the initial balances to start the transaction.',
            { cause: error },
          );
        }
      }

      // execute and confirm the tx
      const { logs, error } = await __executeAndConfirmTransaction(
        tx.side,
        tx.amount,
        getInitialBalancesSnapshot(tx.logs),
      );
      tx.logs = [...tx.logs, ...logs];
      if (typeof error === 'string') {
        throw new Error('Failed to execute and confirm the transaction.', { cause: error });
      }
      tx.status = 'SUCCEEDED';
      await updateTransactionRecord(tx);
    } catch (e) {
      // handle the execution failure
      tx.status = 'FAILED';
      await updateTransactionRecord(tx);
      APIErrorService.save('TransactionService.__scheduleTransaction', e, undefined, undefined, tx);
    }
  };

  /**
   * Starts the process that will try as hard as possible to execute a transaction.
   * @param side
   * @param amount
   * @param balances?
   * @returns Promise<number>
   */
  const execute = async (side: ISide, amount: number, balances?: IBalances): Promise<number> => {
    // build and store the tx
    const rawTX = buildTX(side, amount, balances);
    const id = await createTransactionRecord(rawTX);

    // schedule the tx
    __scheduleTransaction(id, rawTX);

    // finally, return the ID
    return id;
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // retrievers

    // execution
    execute,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const TransactionService = transactionServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  TransactionService,
};
