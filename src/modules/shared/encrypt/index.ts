import { decrypt, encrypt } from 'aes256-async';
import { ENVIRONMENT } from '../environment/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Decrypts the encryptedData and returns it in string format.
 * @param encryptedData
 * @returns Promise<string>
 * @throws
 * - INVALID_OR_EMPTY_DATA: if the data is not a string or is an empty string.
 * - INVALID_SECRET: if the secret is not a string or is an empty string.
 * - INVALID_ENCRYPTED_DATA: if the encrypted data decrypts to an invalid or empty string.
 * - WRONG_SECRET: if the data cannot be decrypted.
 */
const decryptData = (encryptedData: string): Promise<string> => decrypt(
  ENVIRONMENT.ENCRYPTING_SECRET,
  encryptedData,
);

/**
 * Encrypts the data and returns it in string format.
 * @param data
 * @returns string
 * @throws
 * - INVALID_OR_EMPTY_DATA: if the data is not a string or is an empty string.
 * - INVALID_SECRET: if the secret is not a string or is an empty string.
 * - CORRUPTED_DATA: if the decrypted data does not match the original data.
 * - WRONG_SECRET: if the data cannot be decrypted.
 */
const encryptData = (data: string): Promise<string> => encrypt(ENVIRONMENT.ENCRYPTING_SECRET, data);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  decryptData,
  encryptData,
};
