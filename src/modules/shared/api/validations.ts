import {
  stringValid,
  objectValid,
  arrayValid,
  semverValid,
} from '../validations/index.js';
import { ENVIRONMENT } from '../environment/index.js';
import { IPackageFile } from '../types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Ensures the configurations meet all the requirements for the API to be initialized.
 * @throws
 * - If the environment is set to 'production' and the server is being initialized on 'TEST_MODE'
 * - If both, 'TEST_MODE' and 'RESTORE_MODE' are enabled
 */
const canBeInitialized = (): void => {
  if (ENVIRONMENT.NODE_ENV === 'production' && ENVIRONMENT.TEST_MODE) {
    throw new Error('The API could not be initialized because TEST_MODE cannot be enabled when running in a production environment.');
  }
  if (ENVIRONMENT.TEST_MODE && ENVIRONMENT.RESTORE_MODE) {
    throw new Error('The API could not be initialized because TEST_MODE and RESTORE_MODE cannot be enabled simultaneously.');
  }
};

/**
 * Ensures the data extracted from the package.json file is valid.
 * @param file
 * @throws
 * - if any of the package.json's properties are invalid or not provided
 */
const validatePackageFile = (file: IPackageFile): void => {
  if (!objectValid(file)) throw new Error(`The package.json file is not a valid object. Received ${JSON.stringify(file)}`);
  if (!stringValid(file.name, 1)) throw new Error(`The package.json's name property is not a valid string. Received ${file.name}`);
  if (!stringValid(file.description, 1)) throw new Error(`The package.json's description property is not a valid string. Received ${file.description}`);
  if (typeof file.private !== 'boolean') throw new Error(`The package.json's private property is not a valid boolean. Received ${file.private}`);
  if (!semverValid(file.version)) throw new Error(`The package.json's version property is not a valid semver. Received ${file.version}`);
  if (!stringValid(file.type, 1)) throw new Error(`The package.json's type property is not a valid string. Received ${file.type}`);
  if (!stringValid(file.main, 1)) throw new Error(`The package.json's main property is not a valid string. Received ${file.main}`);
  if (!objectValid(file.scripts)) throw new Error(`The package.json's scripts property is not a valid object. Received ${JSON.stringify(file.scripts)}`);
  if (!objectValid(file.repository)) throw new Error(`The package.json's repository property is not a valid object. Received ${JSON.stringify(file.repository)}`);
  if (!arrayValid(file.keywords)) throw new Error(`The package.json's keywords property is not a valid array. Received ${JSON.stringify(file.keywords)}`);
  if (!stringValid(file.author, 1)) throw new Error(`The package.json's author property is not a valid string. Received ${file.author}`);
  if (!stringValid(file.license, 1)) throw new Error(`The package.json's license property is not a valid string. Received ${file.license}`);
  if (!objectValid(file.bugs)) throw new Error(`The package.json's bugs property is not a valid object. Received ${JSON.stringify(file.bugs)}`);
  if (!stringValid(file.homepage, 1)) throw new Error(`The package.json's homepage property is not a valid string. Received ${file.homepage}`);
  if (!objectValid(file.devDependencies)) throw new Error(`The package.json's devDependencies property is not a valid object. Received ${JSON.stringify(file.devDependencies)}`);
  if (!objectValid(file.dependencies)) throw new Error(`The package.json's dependencies property is not a valid object. Received ${JSON.stringify(file.dependencies)}`);
};




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  canBeInitialized,
  validatePackageFile,
};
