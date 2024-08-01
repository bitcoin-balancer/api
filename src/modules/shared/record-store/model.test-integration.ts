import { describe, afterEach, test, expect } from 'vitest';
import { readRecord, writeRecord, deleteRecord } from './model.js';
import { IStoreID } from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// ids
const ID: IStoreID[] = ['AUTOMATED_TESTS_01', 'AUTOMATED_TESTS_02'];

// test records
type ITestRecord = {
  id: number,
  name: string,
  friends: string[],
  job: {
    name: string,
    salary: number,
    coworkers: { name: string, age: number }[]
  }
};
const R: ITestRecord[] = [
  {
    id: 110,
    name: 'John Doe',
    friends: ['Arena', 'Jose', 'John'],
    job: {
      name: 'Engineer',
      salary: 100000,
      coworkers: [
        { name: 'Carlos', age: 40 },
        { name: 'Melisa', age: 33 },
      ],
    },
  },
  {
    id: 54422,
    name: 'Jane Doe',
    friends: ['Amanda', 'David', 'Samuel'],
    job: {
      name: 'Designer',
      salary: 155366,
      coworkers: [
        { name: 'Juan', age: 24 },
        { name: 'Ezekiel', age: 45 },
        { name: 'Cumaraima', age: 32 },
      ],
    },
  },
];



/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('Record Store Model', () => {
  afterEach(async () => {
    await Promise.all([deleteRecord(ID[0]), deleteRecord(ID[1])]);
  });

  test.skip('can calculate 2 plus 2', () => {
    expect(2 + 2).toBe(4);
  });
});
