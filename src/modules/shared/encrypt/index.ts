import aes256 from 'aes256';
import { encodeError } from 'error-message-utils';
import { ENVIRONMENT } from '../environment/index.js';

/**
 * AES256
 * Module in charge of encrypting and decrypting messages by making use of the aes256 algorithm.
 * It makes use of the following lib to simplify the implementation:
 * https://github.com/JamesMGreene/node-aes256
 * IMPORTANT: the symmetric session key (a.k.a. secret, a.k.a. passphrase) can be of any size
 * because it is hashed using SHA-256.
 */

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Decrypts the encryptedData and returns it in string format.
 * @param encryptedData
 * @returns string
 */
const decryptData = (encryptedData: string): string => aes256.decrypt(
  ENVIRONMENT.ENCRYPTING_SECRET,
  encryptedData,
);

/**
 * Encrypts the data, then it decrypts it to ensure the data will not be lost and it returns the
 * encrypted representation.
 * IMPORTANT: if the provided secret is invalid, this function won't throw an error, it will just
 * return a deformed string.
 * @param data
 * @returns string
 * @throws
 * - 34000: if the integrity check of the encrypted data fails
 */
const encryptData = (data: string): string => {
  const encryptedData = aes256.encrypt(ENVIRONMENT.ENCRYPTING_SECRET, data);
  if (decryptData(encryptedData) !== data) {
    throw new Error(encodeError('The integrity of the encrypted data could not be validated.', 34000));
  }
  return encryptedData;
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  decryptData,
  encryptData,
};
