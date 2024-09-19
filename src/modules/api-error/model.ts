import { DatabaseService } from '../database/index.js';
import { IAPIError, IAPIErrorOrigin } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Retrieves a record by ID. If the record is not found it returns null.
 * @param id
 * @returns Promise<IAPIError | null>
 */
const getRecord = async (id: number): Promise<IAPIError | null> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT id, origin, error, event_time, uid, ip, args 
      FROM ${DatabaseService.tn.api_errors} 
      WHERE id = $1;
    `,
    values: [id],
  });
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Retrieves a list of existing API Errors constrained by a limit.
 * @param limit
 * @returns Promise<IAPIError[]>
 */
const __listRecords = async (limit: number): Promise<IAPIError[]> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT id, origin, error, event_time, uid, ip, args 
      FROM ${DatabaseService.tn.api_errors} 
      ORDER BY id DESC
      LIMIT $1;
    `,
    values: [limit],
  });
  return rows;
};

/**
 * Retrieves the list of API Errors starting at the given point. Note: the startAtID record will not
 * be included in the result.
 * @param limit
 * @param startAtID
 * @returns Promise<IAPIError[]>
 */
const __listNextRecords = async (limit: number, startAtID: number): Promise<IAPIError[]> => {
  const { rows } = await DatabaseService.query({
    text: `
      SELECT id, origin, error, event_time, uid, ip, args 
      FROM ${DatabaseService.tn.api_errors} 
      WHERE id < $1
      ORDER BY id DESC
      LIMIT $2;
    `,
    values: [startAtID, limit],
  });
  return rows;
};

/**
 * Retrieves a list of API Errors from the database. If a startAtID is provided, it will only
 * retrieve records that are older than the passed ID (exclusive).
 * @param limit
 * @param startAtID?
 * @returns Promise<IAPIError[]>
 */
const listRecords = (limit: number, startAtID?: number): Promise<IAPIError[]> => (
  typeof startAtID === 'number' ? __listNextRecords(limit, startAtID) : __listRecords(limit)
);

/**
 * Saves a record and returns its identifier.
 * @param origin
 * @param error
 * @param uid
 * @param ip
 * @param args
 * @returns Promise<number>
 */
const saveRecord = async (
  origin: IAPIErrorOrigin,
  error: string,
  uid: string | undefined,
  ip: string | undefined,
  args: Record<string, any> | undefined,
): Promise<number> => {
  const { rows } = await DatabaseService.query({
    text: `
      INSERT INTO ${DatabaseService.tn.api_errors} (origin, error, event_time, uid, ip, args) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id;
    `,
    values: [origin, error, Date.now(), uid, ip, args],
  });
  return rows[0].id;
};

/**
 * Deletes all the existing records from the database.
 * @returns Promise<void>
 */
const deleteAllRecords = async (): Promise<void> => {
  await DatabaseService.query({
    text: `DELETE FROM ${DatabaseService.tn.api_errors};`,
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  getRecord,
  listRecords,
  saveRecord,
  deleteAllRecords,
};
