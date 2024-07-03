/* eslint-disable no-console */
import { readFile } from 'node:fs/promises';
import { ENVIRONMENT } from '../environment/index.js';
import { ITerminationSignal, PackageFileSchema, IPackageFile } from './types.js';

/* ************************************************************************************************
 *                                      PACKAGE FILE HELPERS                                      *
 ************************************************************************************************ */

/**
 * Reads and returns the parsed contents of the package.json file.
 * @returns Promise<IPackageFile>
 */
const readPackageFile = async (): Promise<IPackageFile> => {
  const rawContent = await readFile('package.json', { encoding: 'utf8' });
  return PackageFileSchema.parse(JSON.parse(rawContent));
};





/* ************************************************************************************************
 *                                         PRINT HELPERS                                          *
 ************************************************************************************************ */

/**
 * Prints the initialization header. If the initialization is being retried, it adds several new
 * line spaces so it can be differentiated from previous attempts.
 * @param isRetry
 */
const printInitializationHeader = (isRetry: boolean): void => {
  console.log(`${isRetry ? '\n\n\n\n' : ''}BALANCER API INITIALIZATION\n`);
};

/**
 * Prints the initialization footer once the API is successfully initialized.
 * @param version
 */
const printInitializationFooter = (version: string): void => {
  console.log('\n\n\n\nBALANCER API RUNNING\n');
  console.log(`Version: v${version}`);
  console.log(`Port: ${ENVIRONMENT.API_PORT}`);
  console.log(`Environment: ${ENVIRONMENT.NODE_ENV}`);
  if (ENVIRONMENT.TEST_MODE) console.log('Test Mode: true');
  if (ENVIRONMENT.RESTORE_MODE) console.log('Restore Mode: true');
};

/**
 * Prints the header for the teardown process.
 * @param signal
 */
const printTeardownHeader = (signal: ITerminationSignal | undefined): void => {
  console.log(`\n\n\n\nBALANCER API TEARDOWN${typeof signal === 'string' ? ` (${signal})` : ''}\n`);
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // package file helpers
  readPackageFile,

  // print helpers
  printInitializationHeader,
  printInitializationFooter,
  printTeardownHeader,
};
