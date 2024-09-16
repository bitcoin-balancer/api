import { extractMessage } from 'error-message-utils';
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
  error?: unknown,
): ITransactionLog => ({
  action,
  eventTime: Date.now(),
  outcome,
  payload,
  error: error !== undefined && typeof error !== 'string' ? extractMessage(error) : error,
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
  balances: IBalances,
): Omit<ITransaction, 'id'> => {
  const eventTime = Date.now();
  return {
    event_time: eventTime,
    status: 'PROCESSING',
    side,
    amount,
    logs: [buildLog('INITIAL_BALANCES', true, balances)],
  };
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildLog,
  buildTX,
};
