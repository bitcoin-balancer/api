import { readFile } from 'node:fs/promises';
import { PackageFileSchema, IPackageFile } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
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
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  readPackageFile,
};
