import { extractMessage } from 'error-message-utils';
import { APIErrorService } from '../../api-error/index.js';
import { IBalances, ISide } from '../../shared/exchange/index.js';
import { buildTX } from './utils.js';
import {
  createTransactionRecord,
  updateTransactionRecord,
} from './model.js';
import {
  ITransactionService,
  ITransaction,
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

  // ...





  /* **********************************************************************************************
   *                                           EXECUTION                                          *
   ********************************************************************************************** */

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
    // init the tx
    const tx = { ...rawTX, id };

    try {
      // check if the initial balance needs to be loaded
      if (tx.logs.length === 0) {
        // ...
        await updateTransactionRecord(tx);
      }

      // execute the tx
      // @TODO
      tx.status = 'SUCCEEDED';
      await updateTransactionRecord(tx);
    } catch (e) {
      APIErrorService.save('TransactionService.__scheduleTransaction', e, undefined, undefined, tx);
      tx.status = 'FAILED';
      await updateTransactionRecord(tx);
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
