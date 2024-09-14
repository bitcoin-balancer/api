import { extractMessage } from 'error-message-utils';
import { delay } from '../../shared/utils/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { IBalances, ISide } from '../../shared/exchange/index.js';
import { BalanceService } from '../balance/index.js';
import {
  buildLog,
  buildTX,
  getInitialBalances,
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

  // the delays that will be awaited before trying to execute the action again
  const __RETRY_DELAYS: number[] = [5, 15, 30, 60, 180];





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

  const __executeAndConfirmTransaction = async (
    initialBalances: IBalances,
  ): Promise<ITransactionActionResult> => ({
    logs: [],
  });

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
      const { logs, error } = await __executeAndConfirmTransaction(getInitialBalances(tx.logs));
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
   *                                          RETRIEVERS                                          *
   ********************************************************************************************** */

  // ...





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // execution
    execute,

    // retrievers

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
