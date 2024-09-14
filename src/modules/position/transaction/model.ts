import { DatabaseService } from '../../database/index.js';
import { ITransaction } from './types.js';

/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Retrieves a record by ID. If the record is not found it returns undefined.
 * @param id
 * @returns Promise<ITransaction | undefined>
 */
const getTransactionRecord = async (id: number): Promise<ITransaction | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, event_time, status, side, amount, logs
      FROM ${DatabaseService.tn.transactions}
      WHERE id = $1;
    `,
    values: [id],
  });
  return rows[0];
};

/**
 * Retrieves a list of existing Transactions constrained by a limit.
 * @param limit
 * @returns Promise<ITransaction[]>
 */
const __listTransactionRecords = async (limit: number): Promise<ITransaction[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, event_time, status, side, amount, logs
      FROM ${DatabaseService.tn.transactions}
      ORDER BY id DESC
      LIMIT $1;
    `,
    values: [limit],
  });
  return rows;
};

/**
 * Retrieves the list of Transactions starting at the given point. Note: the startAtID record will
 * not be included in the result.
 * @param limit
 * @param startAtID
 * @returns Promise<ITransaction[]>
 */
const __listNextTransactionRecords = async (
  limit: number,
  startAtID: number,
): Promise<ITransaction[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, event_time, status, side, amount, logs
      FROM ${DatabaseService.tn.transactions}
      WHERE id < $1
      ORDER BY id DESC
      LIMIT $2;
    `,
    values: [startAtID, limit],
  });
  return rows;
};

/**
 * Retrieves a list of Transactions from the database. If a startAtID is provided, it will only
 * retrieve records that are older than the passed ID (exclusive).
 * @param limit
 * @param startAtID?
 * @returns Promise<ITransaction[]>
 */
const listTransactionRecords = (limit: number, startAtID?: number): Promise<ITransaction[]> => (
  typeof startAtID === 'number'
    ? __listNextTransactionRecords(limit, startAtID)
    : __listTransactionRecords(limit)
);

/**
 * Retrieves a list of Transactions that are between a date range.
 * @param startAt
 * @param endAt?
 * @returns Promise<ITransaction[]>
 */
const listTransactionRecordsByRange = async (
  startAt: number,
  endAt?: number,
): Promise<ITransaction[]> => {
  // init values
  let text: string = `
    SELECT id, event_time, status, side, amount, logs
    FROM ${DatabaseService.tn.transactions}
    WHERE event_time >= $1
  `;
  const values: number[] = [startAt];

  // include the conditional clause based on params
  if (typeof endAt === 'number') {
    text += ' AND event_time <= $2';
    values.push(endAt);
  }

  // order the records
  text += ' ORDER BY event_time ASC;';

  // execute the query and return the results
  const { rows } = await DatabaseService.pool.query({ text, values });
  return rows;
};





/* ************************************************************************************************
 *                                            ACTIONS                                             *
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
  // retrievers
  getTransactionRecord,
  listTransactionRecords,
  listTransactionRecordsByRange,

  // actions
  createTransactionRecord,
  updateTransactionRecord,
};
