import { describe, test, expect } from 'vitest';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { DatabaseService } from './index.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('Database Summary', () => {
  describe('getDatabaseSummary', () => {
    test('can retrieve the summary of the database', async () => {
      const summary = await DatabaseService.getDatabaseSummary();
      expect(summary).toStrictEqual({
        name: ENVIRONMENT.POSTGRES_DB,
        version: expect.any(String),
        size: expect.any(Number),
        port: ENVIRONMENT.POSTGRES_PORT,
        tables: Object.values(DatabaseService.tn).map((name) => ({
          name,
          size: expect.any(Number),
        })),
      });
    });
  });
});
