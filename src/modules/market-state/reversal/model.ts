import { DatabaseService } from '../../database/index.js';
import { IPriceCrashStateRecord } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves a price crash state record. If unable to match the ID, it returns undefined.
 * @param id
 * @returns Promise<IPriceCrashStateRecord | undefined>
 */
const getStateRecord = async (id: string): Promise<IPriceCrashStateRecord | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, highest_points, final_points, event_time, reversal_event_time
      FROM ${DatabaseService.tn.price_crash_states}
      WHERE id = $1;
    `,
    values: [id],
  });
  return rows[0];
};

/**
 * Stores a price crash state record once it is complete.
 * @param record
 * @returns Promise<void>
 */
const createStateRecord = async ({
  id,
  highest_points,
  final_points,
  event_time,
  reversal_event_time,
}: IPriceCrashStateRecord): Promise<void> => {
  await DatabaseService.pool.query({
    text: `
      INSERT INTO ${DatabaseService.tn.price_crash_states} (id, highest_points, final_points, event_time, reversal_event_time)
      VALUES ($1, $2, $3, $4, $5);
    `,
    values: [id, highest_points, final_points, event_time, reversal_event_time],
  });
};

/**
 * Retrieves a list of price crash state records constrained by a limit.
 * @param limit
 * @returns Promise<IPriceCrashStateRecord[]>
 */
const __listRecords = async (limit: number): Promise<IPriceCrashStateRecord[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, highest_points, final_points, event_time, reversal_event_time
      FROM ${DatabaseService.tn.price_crash_states}
      ORDER BY event_time DESC
      LIMIT $1;
    `,
    values: [limit],
  });
  return rows;
};

/**
 * Retrieves a list of price crash state records starting at a given point. Keep in mind that
 * startAtEventTime record won't be included in the result.
 * @param limit
 * @param startAtEventTime
 * @returns Promise<IPriceCrashStateRecord[]>
 */
const __listNextRecords = async (
  limit: number,
  startAtEventTime: number,
): Promise<IPriceCrashStateRecord[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, highest_points, final_points, event_time, reversal_event_time
      FROM ${DatabaseService.tn.price_crash_states}
      WHERE event_time < $1
      ORDER BY event_time DESC
      LIMIT $2;
    `,
    values: [startAtEventTime, limit],
  });
  return rows;
};

/**
 * Retrieves a list of price crash state records. If the startAtEventTime is provided, it
 * will only retrieve records that are older than the passed timestamp (exclusive).
 * @param limit
 * @param startAtEventTime?
 * @returns Promise<IPriceCrashStateRecord[]>
 */
const listStateRecords = async (
  limit: number,
  startAtEventTime?: number,
): Promise<IPriceCrashStateRecord[]> => (
  typeof startAtEventTime === 'number'
    ? __listNextRecords(limit, startAtEventTime)
    : __listRecords(limit)
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getStateRecord,
  createStateRecord,
  listStateRecords,
};
