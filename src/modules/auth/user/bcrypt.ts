import bcrypt from 'bcrypt';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

/**
 * Salt Rounds
 * When hashing passwords, the module will go through a series of rounds to give you a secure hash.
 * The value you submit is not just the number of rounds the module will go through to hash your
 * data. The module will use the value you enter and go through 2^SALT_ROUNDS hashing iterations.
 * https://github.com/kelektiv/node.bcrypt.js?tab=readme-ov-file#a-note-on-rounds
 */
const SALT_ROUNDS = 10;





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Hashes a given password based on a random salt.
 * @param password
 * @returns Promise<string>
 */
const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, SALT_ROUNDS);

/**
 * Compares a plain text password against a hash generated by the bcrypt library.
 * @param password
 * @param passwordHash
 * @returns Promise<boolean>
 */
const comparePassword = (password: string, passwordHash: string): Promise<boolean> => (
  bcrypt.compare(password, passwordHash)
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  hashPassword,
  comparePassword,
};
