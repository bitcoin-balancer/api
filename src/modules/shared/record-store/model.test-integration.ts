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
  id: number;
  name: string;
  friends: string[];
  job: {
    name: string;
    salary: number;
    coworkers: { name: string; age: number }[];
  };
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

  test('can initialize and update a record', async () => {
    await expect(readRecord(ID[0])).resolves.toBeNull();
    await writeRecord(ID[0], R[0], true);
    await expect(readRecord(ID[0])).resolves.toStrictEqual(R[0]);
    await writeRecord(ID[0], R[1]);
    await expect(readRecord(ID[0])).resolves.toStrictEqual(R[1]);
    await deleteRecord(ID[0]);
    await expect(readRecord(ID[0])).resolves.toBeNull();
  });

  test('can manage any number of records simultaneously', async () => {
    await writeRecord(ID[0], R[0], true);
    await writeRecord(ID[1], R[1], true);
    await expect(readRecord(ID[0])).resolves.toStrictEqual(R[0]);
    await expect(readRecord(ID[1])).resolves.toStrictEqual(R[1]);
    await deleteRecord(ID[0]);
    await expect(readRecord(ID[0])).resolves.toBeNull();
    await deleteRecord(ID[1]);
    await expect(readRecord(ID[1])).resolves.toBeNull();
  });
});
