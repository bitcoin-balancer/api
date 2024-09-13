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

  const __scheduleTransaction = async (tx: ITransaction): Promise<void> => {



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
    const tx: ITransaction = { ...rawTX, id };

    // schedule the tx
    __scheduleTransaction(tx);

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
