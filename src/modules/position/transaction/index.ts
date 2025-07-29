import { encodeError, extractMessage } from 'error-message-utils';
import { delay } from 'web-utils-kit';
import { ENVIRONMENT } from '../../shared/environment/index.js';
import { APIErrorService } from '../../api-error/index.js';
import { NotificationService } from '../../notification/index.js';
import { ExchangeService, IBalances, ISide } from '../../shared/exchange/index.js';
import { BalanceService } from '../balance/index.js';
import { buildLog, buildTX } from './utils.js';
import { canTransactionBeRetrieved, canRecordsBeListed } from './validations.js';
import {
  getTransactionRecord,
  listTransactionRecords,
  listTransactionRecordsByRange,
  getLastBuyTransactionRecordID,
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

  /**
   * Retrieves a transaction record from the database.
   * @param id
   * @returns Promise<ITransaction>
   * @throws
   * - 32500: if the identifier is invalid
   * - 32000: if the tx is not found in the db
   */
  const getTransaction = async (id: number): Promise<ITransaction> => {
    canTransactionBeRetrieved(id);
    const record = await getTransactionRecord(id);
    if (!record) {
      throw new Error(encodeError(`The transaction '${id}' was not found in the database.`, 32000));
    }
    return record;
  };

  /**
   * Retrieves a series of transactions. If the startAtID is provided, it will start at that point
   * exclusively.
   * @param limit
   * @param startAtID
   * @returns Promise<ITransaction[]>
   * @throws
   * - 32501: if the query limit is larger than the limit
   * - 32502: if the startAtID was provided and is not a valid identifier
   */
  const listTransactions = (
    limit: number,
    startAtID: number | undefined,
  ): Promise<ITransaction[]> => {
    canRecordsBeListed(limit, startAtID);
    return listTransactionRecords(limit, startAtID);
  };

  /**
   * Retrieves a list of Transactions that are between a date range.
   * @param startAt
   * @param endAt?
   * @returns Promise<ITransaction[]>
   */
  const listTransactionsByRange = listTransactionRecordsByRange;

  /**
   * Retrieves the ID for the last executed buy transaction. If there are no buy transactions it
   * returns undefined.
   * @returns Promise<number | undefined>
   */
  const getLastBuyTransactionID = getLastBuyTransactionRecordID;

  /* **********************************************************************************************
   *                                           EXECUTION                                          *
   ********************************************************************************************** */

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
      const balances = await BalanceService.getBalances();

      // confirm the tx took place
      if (initialBalances[__BASE_ASSET] !== balances[__BASE_ASSET]) {
        return { logs: [...logs, buildLog('CONFIRMATION', true, balances)] };
      }
      const msg =
        'The balance did not change after the transaction request was sent to the Exchange.';
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
   * Builds, schedules and confirms a transaction was executed in a persistent manner. If unable to
   * do so, it handles the failure.
   * @param id
   * @param rawTX
   * @returns Promise<void>
   */
  const __scheduleTransaction = async (
    id: number,
    rawTX: Omit<ITransaction, 'id'>,
  ): Promise<void> => {
    // build and attempt to execute the transaction
    const tx = { ...rawTX, id };
    try {
      const { logs, error } = await __executeAndConfirmTransaction(
        tx.side,
        tx.amount,
        tx.logs[0].payload as IBalances,
      );
      tx.logs = [...tx.logs, ...logs];
      if (typeof error === 'string') {
        throw new Error('Failed to execute and confirm the transaction.', { cause: error });
      }
      tx.status = 'SUCCEEDED';
      await updateTransactionRecord(tx);
      NotificationService.txExecutedSuccessfully(tx.side, tx.amount);
    } catch (e) {
      // handle the execution failure
      const msg = extractMessage(e);
      tx.status = 'FAILED';
      await updateTransactionRecord(tx);
      APIErrorService.save(
        'TransactionService.__scheduleTransaction',
        msg,
        undefined,
        undefined,
        tx,
      );
      NotificationService.failedToExecuteTX(tx.side, tx.amount, msg);
    }
  };

  /**
   * Starts the process that will try as hard as possible to execute a transaction.
   * @param side
   * @param amount
   * @param balances
   * @returns Promise<number>
   */
  const __execute = async (side: ISide, amount: number, balances: IBalances): Promise<number> => {
    // build and store the tx
    const rawTX = buildTX(side, amount, balances);
    const id = await createTransactionRecord(rawTX);

    // schedule the tx
    __scheduleTransaction(id, rawTX);

    // finally, return the ID
    return id;
  };

  /**
   * Starts the process that will try as hard as possible to execute a buy transaction.
   * @param amount
   * @param balances
   * @returns Promise<number>
   */
  const buy = async (amount: number, balances: IBalances): Promise<number> =>
    __execute('BUY', amount, balances);

  /**
   * Starts the process that will try as hard as possible to execute a sell transaction.
   * @param amount
   * @param balances
   * @returns Promise<number>
   */
  const sell = async (amount: number, balances: IBalances): Promise<number> =>
    __execute('SELL', amount, balances);

  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // retrievers
    getTransaction,
    listTransactions,
    listTransactionsByRange,
    getLastBuyTransactionID,

    // execution
    buy,
    sell,
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
  // service
  TransactionService,

  // types
  type ITransaction,
};
