import { isNumberValid, isStringValid } from 'web-utils-kit';
import { IAuthority } from '../../auth/user/types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if a value is a valid authority level.
 * @param value
 * @param max?
 * @returns boolean
 */
const authorityValid = (value: unknown, max?: IAuthority): value is IAuthority => (
  isNumberValid(value, 1, max ?? 5)
);

/**
 * Verifies if a value is (or could be) an Altcha Payload.
 * @param value
 * @returns boolean
 */
const altchaPayloadValid = (value: unknown): value is string => isStringValid(value, 100, 1000);

/**
 * Verifies if a value is (or could be) an IP Address.
 * @param value
 * @returns boolean
 */
const ipValid = (value: unknown): value is string => isStringValid(value, 5, 300);

/**
 * Verifies if a value is (or could be) notes to be attached to an IP Address.
 * @param value
 * @returns boolean
 */
const ipNotesValid = (value: unknown): value is string => isStringValid(value, 5, 25000);

/**
 * Verifies if a value is (or could be) an asset's symbol.
 * @param value
 * @returns boolean
 */
const symbolValid = (value: unknown): value is string => (
  typeof value === 'string'
  && /^[A-Z0-9]{1,20}$/.test(value)
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  authorityValid,
  altchaPayloadValid,
  ipValid,
  ipNotesValid,
  symbolValid,
};
