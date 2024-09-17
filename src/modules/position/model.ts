import { DatabaseService } from '../database/index.js';
import { IPosition, ICompactPosition } from './types.js';

/* ************************************************************************************************
 *                                            POSITION                                            *
 ************************************************************************************************ */

/**
 * Returns a position record by ID. If none is found it returns undefined.
 * @param id
 * @returns Promise<IPosition | undefined>
 */
const getPositionRecord = async (id: string): Promise<IPosition | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, open, close, entry_price, gain, amount, amount_quote, amount_quote_in, amount_quote_out, pnl, roi, decrease_price_levels, increase_actions, decrease_actions
      FROM ${DatabaseService.tn.positions}
      WHERE id = $1;
    `,
    values: [id],
  });
  return rows[0];
};

/**
 * Retrieves the record for the position that is active. If none is, it returns undefined.
 * @returns Promise<IPosition | undefined>
 */
const getActivePositionRecord = async (): Promise<IPosition | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, open, close, entry_price, gain, amount, amount_quote, amount_quote_in, amount_quote_out, pnl, roi, decrease_price_levels, increase_actions, decrease_actions
      FROM ${DatabaseService.tn.positions}
      WHERE close IS NULL;
    `,
    values: [],
  });
  return rows[0];
};

/**
 * Creates a brand new position record.
 * @param position
 * @returns Promise<number>
 */
const createPositionRecord = async ({
  id,
  open,
  close,
  entry_price,
  gain,
  amount,
  amount_quote,
  amount_quote_in,
  amount_quote_out,
  pnl,
  roi,
  decrease_price_levels,
  increase_actions,
  decrease_actions,
}: IPosition): Promise<void> => {
  await DatabaseService.pool.query({
    text: `
      INSERT INTO ${DatabaseService.tn.positions} (id, open, close, entry_price, gain, amount, amount_quote, amount_quote_in, amount_quote_out, pnl, roi, decrease_price_levels, increase_actions, decrease_actions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
    `,
    values: [
      id, open, close, entry_price, gain, amount, amount_quote, amount_quote_in, amount_quote_out,
      pnl, roi, JSON.stringify(decrease_price_levels), JSON.stringify(increase_actions),
      JSON.stringify(decrease_actions),
    ],
  });
};

/**
 * Updates a position record.
 * @param position
 * @returns Promise<void>
 */
const updatePositionRecord = async ({
  id,
  close,
  entry_price,
  gain,
  amount,
  amount_quote,
  amount_quote_in,
  amount_quote_out,
  pnl,
  roi,
  decrease_price_levels,
  increase_actions,
  decrease_actions,
}: IPosition): Promise<void> => {
  await DatabaseService.pool.query({
    text: `
      UPDATE ${DatabaseService.tn.positions}
      SET close = $1, entry_price = $2, gain = $3, amount = $4, amount_quote = $5, amount_quote_in = $6, amount_quote_out = $7, pnl = $8, roi = $9, decrease_price_levels = $10, increase_actions = $11, decrease_actions = $12
      WHERE id = $13;
    `,
    values: [
      close, entry_price, gain, amount, amount_quote, amount_quote_in, amount_quote_out, pnl,
      roi, JSON.stringify(decrease_price_levels), JSON.stringify(increase_actions),
      JSON.stringify(decrease_actions), id,
    ],
  });
};

/**
 * Deletes all the existing records from the database. This function should only be invoked from
 * automated tests.
 * @returns Promise<void>
 */
const deleteAllPositionRecords = async (): Promise<void> => {
  await DatabaseService.pool.query({
    text: `DELETE FROM ${DatabaseService.tn.positions};`,
  });
};





/* ************************************************************************************************
 *                                        COMPACT POSITION                                        *
 ************************************************************************************************ */

/**
 * Retrieves a list of positions constrained by a limit.
 * @param limit
 * @returns Promise<ICompactPosition[]>
 */
const __listCompactPositionRecords = async (limit: number): Promise<ICompactPosition[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, open, close, entry_price, gain, amount, amount_quote, amount_quote_in, amount_quote_out, pnl, roi
      FROM ${DatabaseService.tn.positions}
      ORDER BY open DESC
      LIMIT $1;
    `,
    values: [limit],
  });
  return rows;
};

/**
 * Retrieves the list of positions starting at the given point. Note: the startAtOpenTime record
 * will not be included in the result.
 * @param limit
 * @param startAtOpenTime
 * @returns Promise<ICompactPosition[]>
 */
const __listNextCompactPositionRecords = async (
  limit: number,
  startAtOpenTime: number,
): Promise<ICompactPosition[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, open, close, entry_price, gain, amount, amount_quote, amount_quote_in, amount_quote_out, pnl, roi
      FROM ${DatabaseService.tn.positions}
      WHERE open < $1
      ORDER BY open DESC
      LIMIT $2;
    `,
    values: [startAtOpenTime, limit],
  });
  return rows;
};

/**
 * Retrieves a list of positions from the database. If a startAtOpenTime is provided, it will only
 * retrieve records that are older than the passed open time (exclusive).
 * @param limit
 * @param startAtOpenTime?
 * @returns Promise<ICompactPosition[]>
 */
const listCompactPositionRecords = (
  limit: number,
  startAtOpenTime?: number,
): Promise<ICompactPosition[]> => (
  typeof startAtOpenTime === 'number'
    ? __listNextCompactPositionRecords(limit, startAtOpenTime)
    : __listCompactPositionRecords(limit)
);

/**
 * Retrieves a list of compact positions that are between a date range.
 * @param startAt
 * @param endAt?
 * @returns Promise<ICompactPosition[]>
 */
const listCompactPositionRecordsByRange = async (
  startAt: number,
  endAt?: number,
): Promise<ICompactPosition[]> => {
  // init values
  let text: string = `
    SELECT id, open, close, entry_price, gain, amount, amount_quote, amount_quote_in, amount_quote_out, pnl, roi
    FROM ${DatabaseService.tn.transactions}
    WHERE open >= $1
  `;
  const values: number[] = [startAt];

  // include the conditional clause based on params
  if (typeof endAt === 'number') {
    text += ' AND open <= $2';
    values.push(endAt);
  }

  // order the records
  text += ' ORDER BY open ASC;';

  // execute the query and return the results
  const { rows } = await DatabaseService.pool.query({ text, values });
  return rows;
};




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // position
  getPositionRecord,
  getActivePositionRecord,
  createPositionRecord,
  updatePositionRecord,
  deleteAllPositionRecords,

  // compact position
  listCompactPositionRecords,
  listCompactPositionRecordsByRange,
};
