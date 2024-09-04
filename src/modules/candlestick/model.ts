import { DatabaseService } from '../database/index.js';
import { ICombinedCompactCandlestickRecords, IEventHistoryRecord } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves a record by ID. If the record is not found it returns undefined.
 * @param id
 * @returns Promise<IEventHistoryRecord | undefined>
 */
const getEventHistoryRecord = async (id: string): Promise<IEventHistoryRecord | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, event, interval, records, event_time
      FROM ${DatabaseService.tn.event_candlesticks}
      WHERE id = $1;
    `,
    values: [id],
  });
  return rows[0];
};

/**
 * Saves the event history in pristine state.
 * @param hist
 * @returns Promise<void>
 */
const createEventHistory = async (hist: IEventHistoryRecord): Promise<void> => {
  await DatabaseService.pool.query({
    text: `
      INSERT INTO ${DatabaseService.tn.event_candlesticks} (id, event, interval, records, event_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `,
    values: [hist.id, hist.event, hist.interval, hist.records, hist.event_time],
  });
};

/**
 * Updates the candlestick records for an event by ID.
 * @param id
 * @param records
 * @returns Promise<void>
 */
const updateRecords = async (
  id: string,
  records: ICombinedCompactCandlestickRecords,
): Promise<void> => {
  await DatabaseService.pool.query({
    text: `
      UPDATE ${DatabaseService.tn.event_candlesticks}
      SET records = $1
      WHERE id = $2;
    `,
    values: [records, id],
  });
};

/**
 * Deletes all of the history records from the database. This function is to be invoked by
 * automated tests only.
 * @returns Promise<void>
 */
const deleteAllRecords = async (): Promise<void> => {
  await DatabaseService.pool.query({
    text: `DELETE FROM ${DatabaseService.tn.event_candlesticks};`,
    values: [],
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getEventHistoryRecord,
  createEventHistory,
  updateRecords,
  deleteAllRecords,
};
