import { readFile } from 'node:fs/promises';
import { ENVIRONMENT } from '../environment/environment.js';
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
  console.log(`${isRetry ? '\n\n\n' : ''}Balancer API Initialization:`);
};

/**
 * Prints the initialization footer once the API is successfully initialized.
 * @param version
 */
const printInitializationFooter = (version: string): void => {
  console.log('\n\n\nBalancer API Running:');
  console.log(`Version: v${version}`);
  console.log(`Port: ${ENVIRONMENT.serverPort}`);
  console.log(`Environment: ${ENVIRONMENT.environment}`);
  if (ENVIRONMENT.testMode) console.log('Test Mode: true');
  if (ENVIRONMENT.restoreMode) console.log('Restore Mode: true');
};

/**
 * Prints the header for the teardown process.
 * @param signal
 */
const printTeardownHeader = (signal: ITerminationSignal | undefined): void => {
  console.log(`\n\n\nBalancer API Teardown${typeof signal === 'string' ? ` (${signal})` : ''}:`);
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
