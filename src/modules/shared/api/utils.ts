/* eslint-disable no-console */
import { readFileSync } from 'node:fs';
import { ENVIRONMENT } from '../environment/index.js';
import { validatePackageFile } from './validations.js';
import { ITerminationSignal, IPackageFile } from './types.js';

/* ************************************************************************************************
 *                                      PACKAGE FILE HELPERS                                      *
 ************************************************************************************************ */

/**
 * Reads and returns the parsed contents of the package.json file.
 * @returns IPackageFile
 */
const readPackageFile = (): IPackageFile => {
  const packageFile: IPackageFile = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }));
  validatePackageFile(packageFile);
  return packageFile;
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
