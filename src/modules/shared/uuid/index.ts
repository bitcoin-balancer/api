import { v4 as uuidv4, version as uuidVersion, validate as uuidValidate } from 'uuid';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Generates an Universally Unique IDentifier (Version 4).
 * @returns string
 */
const generateUUID = (): string => uuidv4();

/**
 * Ensures the format and the version of an UUID are valid.
 * @param uuid
 * @returns boolean
 */
const validateUUID = (uuid: string): boolean => uuidValidate(uuid) && uuidVersion(uuid) === 4;





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // implementation
  generateUUID,
  validateUUID,
};
