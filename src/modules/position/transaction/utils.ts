/* eslint-disable no-console */
import { encodeError } from 'error-message-utils';
import { ISide, IBalances } from '../../shared/exchange/index.js';
import {
  ITransaction,
  ITransactionActionName,
  ITransactionLog,
} from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Builds a log object for an action.
 * @param action
 * @param log
 * @returns ITransactionLog
 */
const buildLog = (
  action: ITransactionActionName,
  outcome: boolean,
  payload?: Record<string, unknown> | IBalances,
  error?: string,
): ITransactionLog => ({
  action,
  eventTime: Date.now(),
  outcome,
  payload,
  error,
});

/**
 * Builds the transaction object in the initial state.
 * @param side
 * @param amount
 * @param balances
 * @returns Omit<ITransaction, 'id'>
 */
const buildTX = (
  side: ISide,
  amount: number,
  balances: IBalances | undefined,
): Omit<ITransaction, 'id'> => {
  const eventTime = Date.now();
  return {
    event_time: eventTime,
    status: 'PROCESSING',
    side,
    amount,
    logs: balances === undefined ? [] : [buildLog('INITIAL_BALANCES', true, balances)],
  };
};

/**
 * Retrieves the initial balances snapshot from the logs.
 * @param logs
 * @returns IBalances
 * @throws
 * - 32250: if the snapshot is not found in the logs
 */
const getInitialBalances = (logs: ITransactionLog[]): IBalances => {
  const initialBalancesLog = logs.find((log) => log.action === 'INITIAL_BALANCES' && log.outcome);
  if (!initialBalancesLog) {
    console.log(logs);
    throw new Error(encodeError('The initial balances snapshot could not be extracted from the logs.', 32250));
  }
  return initialBalancesLog.payload as IBalances;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildLog,
  buildTX,
  getInitialBalances,
};
