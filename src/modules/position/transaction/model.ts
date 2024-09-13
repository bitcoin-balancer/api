import { DatabaseService } from '../../database/index.js';
import { ITransaction } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Inserts a transaction record into the database.
 * @param t
 * @returns Promise<number>
 */
const createTransactionRecord = async (tx: Omit<ITransaction, 'id'>): Promise<number> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      INSERT INTO ${DatabaseService.tn.transactions} (event_time, status, side, amount, logs)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `,
    values: [tx.event_time, tx.status, tx.side, tx.amount, tx.logs],
  });
  return rows[0].id;
};

/**
 * Updates the dynamic properties of a transaction.
 * @param tx
 * @returns Promise<void>
 */
const updateTransactionRecord = async (tx: ITransaction): Promise<void> => {
  await DatabaseService.pool.query({
    text: `
      UPDATE ${DatabaseService.tn.transactions}
      SET status = $1, logs = $2
      WHERE id = $3
    `,
    values: [tx.status, tx.logs, tx.id],
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  createTransactionRecord,
  updateTransactionRecord,
};
