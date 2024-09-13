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
  payload?: Record<string, unknown> | IBalances,
  error?: string,
): ITransactionLog => ({
  action,
  eventTime: Date.now(),
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
    logs: balances === undefined
      ? []
      : [buildLog('INITIAL_BALANCES', balances)],
  };
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  buildLog,
  buildTX,
};
