import { DatabaseService, IQueryResult } from '../database/index.js';
import { IIPBlacklistRecord } from './types.js';

/* ************************************************************************************************
 *                                           RETRIEVERS                                           *
 ************************************************************************************************ */

/**
 * Retrieves an IP Blacklist record by ID. If none is found, it returns undefined.
 * @param id
 * @returns Promise<IIPBlacklistRecord | undefined>
 */
const getRecord = async (id: number): Promise<IIPBlacklistRecord | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, ip, notes, event_time
      FROM ${DatabaseService.tn.ip_blacklist}
      WHERE id = $1;
    `,
    values: [id],
  });
  return rows[0];
};

/**
 * Retrieves an IP Blacklist record by IP. If none is found, it returns undefined.
 * @param ip
 * @returns Promise<IIPBlacklistRecord | undefined>
 */
const getRecordByIP = async (ip: string): Promise<IIPBlacklistRecord | undefined> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, ip, notes, event_time
      FROM ${DatabaseService.tn.ip_blacklist}
      WHERE ip = $1;
    `,
    values: [ip],
  });
  return rows[0];
};

/**
 * Retrieves a list of all the IP Addresses that are currently blacklisted.
 * @returns Promise<string[]>
 */
const listIPs = async (): Promise<string[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `SELECT ip FROM ${DatabaseService.tn.ip_blacklist};`,
    values: [],
  });
  return rows.map((record) => record.ip);
};

/**
 * Retrieves a list of IP Blacklist Records constrained by a limit.
 * @param limit
 * @returns Promise<IIPBlacklistRecord[]>
 */
const __listRecords = async (limit: number): Promise<IIPBlacklistRecord[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, ip, notes, event_time
      FROM ${DatabaseService.tn.ip_blacklist} 
      ORDER BY id DESC
      LIMIT $1;
    `,
    values: [limit],
  });
  return rows;
};

/**
 * Retrieves the list of IP Blacklist Records starting at the given point. Note: the startAtID
 * record will not be included in the result.
 * @param limit
 * @param startAtID
 * @returns Promise<IIPBlacklistRecord[]>
 */
const __listNextRecords = async (
  limit: number,
  startAtID: number,
): Promise<IIPBlacklistRecord[]> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      SELECT id, ip, notes, event_time
      FROM ${DatabaseService.tn.ip_blacklist} 
      WHERE id < $1
      ORDER BY id DESC
      LIMIT $2;
    `,
    values: [startAtID, limit],
  });
  return rows;
};

/**
 * Retrieves a list of IP Blacklist Records from the database. If a startAtID is provided, it will
 * only retrieve records that are older than the passed ID (exclusive).
 * @param limit
 * @param startAtID?
 * @returns Promise<IIPBlacklistRecord[]>
 */
const listRecords = (limit: number, startAtID?: number): Promise<IIPBlacklistRecord[]> => (
  typeof startAtID === 'number' ? __listNextRecords(limit, startAtID) : __listRecords(limit)
);





/* ************************************************************************************************
 *                                        RECORD MANAGEMENT                                       *
 ************************************************************************************************ */

/**
 * Creates an IP Blacklist record and returns its identifier.
 * @param ip
 * @param notes
 * @returns Promise<number>
 */
const createRecord = async (ip: string, notes: string | undefined): Promise<number> => {
  const { rows } = await DatabaseService.pool.query({
    text: `
      INSERT INTO ${DatabaseService.tn.ip_blacklist} (ip, notes, event_time)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
    values: [ip, notes, Date.now()],
  });
  return rows[0].id;
};

/**
 * Updates an IP Blacklist record.
 * @param id
 * @param ip
 * @param notes
 * @returns Promise<IQueryResult>
 */
const updateRecord = (id: number, ip: string, notes: string | undefined): Promise<IQueryResult> => (
  DatabaseService.pool.query({
    text: `
      UPDATE ${DatabaseService.tn.ip_blacklist} 
      SET ip = $1, notes = $2
      WHERE id = $3
    `,
    values: [ip, notes, id],
  })
);

/**
 * Deletes an IP Blacklist record.
 * @param id
 * @returns Promise<IQueryResult>
 */
const deleteRecord = (id: number): Promise<IQueryResult> => DatabaseService.pool.query({
  text: `
    DELETE FROM ${DatabaseService.tn.ip_blacklist}
    WHERE id = $1;
  `,
  values: [id],
});

/**
 * Deletes all of the IP Blacklist records from the database. This function is to be invoked by
 * automated tests only.
 * @returns Promise<IQueryResult>
 */
const deleteAllRecords = (): Promise<IQueryResult> => DatabaseService.pool.query({
  text: `DELETE FROM ${DatabaseService.tn.ip_blacklist};`,
  values: [],
});





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // retrievers
  getRecord,
  getRecordByIP,
  listIPs,
  listRecords,

  // record management
  createRecord,
  updateRecord,
  deleteRecord,
  deleteAllRecords,
};
