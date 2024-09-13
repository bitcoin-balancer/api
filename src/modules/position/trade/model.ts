import { DatabaseService } from '../../database/index.js';
import { ITrade } from '../../shared/exchange/index.js';

/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Retrieves a trade record. Returns undefined if the record is not found.
 * @param id
 * @returns Promise<ITrade | undefined>
 */
const getTradeRecord = async (id: number): Promise<ITrade | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, id_alt, notes, side, price, amount, amount_quote, comission, event_time
      FROM ${DatabaseService.tn.trades}
      WHERE id >= $1
    `,
    values: [id],
  });
  return rows[0];
};

/**
 * Retrieves a list of trades from the database based on a given range.
 * @param startAt
 * @param endAt?
 * @returns Promise<ITrade[]>
 */
const listTradeRecords = async (startAt: number, endAt?: number): Promise<ITrade[]> => {
  // init values
  let text: string = `
    SELECT id, id_alt, notes, side, price, amount, amount_quote, comission, event_time
    FROM ${DatabaseService.tn.trades}
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
 *                                             ACTIONS                                            *
 ************************************************************************************************ */

/**
 * Saves a list of trades into the database that have just been retrieved from the database.
 * @param trades
 * @returns Promise<void>
 */
const saveTradeRecords = async (trades: ITrade[]): Promise<void> => {
  const client = await DatabaseService.pool.connect();
  try {
    await client.query('BEGIN');
    await Promise.all(trades.map((t) => client.query({
      text: `
        INSERT INTO ${DatabaseService.tn.trades} (id_alt, side, price, amount, amount_quote, comission, event_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      values: [t.id_alt, t.side, t.price, t.amount, t.amount_quote, t.comission, t.event_time],
    })));
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

/**
 * Inserts a trade that was manually created into the database.
 * @param t
 * @returns Promise<number>
 */
const createTradeRecord = async (t: ITrade): Promise<number> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      INSERT INTO ${DatabaseService.tn.trades} (notes, side, price, amount, amount_quote, comission, event_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `,
    values: [t.notes, t.side, t.price, t.amount, t.amount_quote, t.comission, t.event_time],
  });
  return rows[0].id;
};

/**
 * Updates a trade that was manually created.
 * @param t
 * @returns Promise<void>
 */
const updateTradeRecord = async (t: ITrade): Promise<void> => {
  await DatabaseService.pool.query({
    text: `
      UPDATE ${DatabaseService.tn.trades}
      SET notes = $1, side = $2, price = $3, amount = $4, amount_quote = $5, comission = $6, event_time = $7
      WHERE id = $8;
    `,
    values: [t.notes, t.side, t.price, t.amount, t.amount_quote, t.comission, t.event_time, t.id],
  });
};

/**
 * Deletes a trade record that was manually created from the database.
 * @param id
 * @returns Promise<void>
 */
const deleteTradeRecord = async (id: number): Promise<void> => {
  await DatabaseService.pool.query({
    text: `DELETE FROM ${DatabaseService.tn.trades} WHERE id = $1;`,
    values: [id],
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // retrievers
  getTradeRecord,
  listTradeRecords,

  // actions
  saveTradeRecords,
  createTradeRecord,
  updateTradeRecord,
  deleteTradeRecord,
};
