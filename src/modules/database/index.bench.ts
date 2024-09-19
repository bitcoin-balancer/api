import { describe, bench } from 'vitest';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { IDatabaseSummary, IDatabaseSummaryTable, ITableName, ITestTableName } from './types.js';
import { DatabaseService } from './index.js';

/**
 * Mock getDatabaseSummary to find the best implementation approach;
 */
const __getSummaryTable = async (
  name: ITableName | ITestTableName,
): Promise<IDatabaseSummaryTable> => {
  const { rows } = await DatabaseService.query({ text: `SELECT pg_total_relation_size('${name}');` });
  return {
    name,
    size: rows[0].pg_total_relation_size,
  };
};
const getDatabaseSummaryAlt = async (): Promise<IDatabaseSummary> => {
  // Init the client
  const client = await DatabaseService.pool.connect();

  try {
    // Retrieve the version of the database
    const version = await client.query('SELECT version();');

    // Retrieve the size of the entire database
    const dbSize = await client.query(`SELECT pg_database_size('${ENVIRONMENT.POSTGRES_DB}');`);

    // put together the summary tables
    const tables = await Promise.all(Object.values(DatabaseService.tn).map(__getSummaryTable));

    // Return the Summary
    return {
      name: ENVIRONMENT.POSTGRES_DB,
      version: version.rows[0].version,
      size: dbSize.rows[0].pg_database_size,
      port: ENVIRONMENT.POSTGRES_PORT,
      tables,
    };
  } finally {
    client.release();
  }
};


describe.skip('Database Summary', () => {
  bench('using getDatabaseSummary()', async () => {
    await Promise.resolve(DatabaseService.getDatabaseSummary());
  });

  bench('using a single pool connection ', async () => {
    await Promise.resolve(getDatabaseSummaryAlt());
  });
});
