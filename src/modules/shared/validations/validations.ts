import { IAuthority } from '../../auth/types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if a value is a valid string and its length is within a range (optional)
 * @param value
 * @param minLength?
 * @param maxLength?
 * @returns boolean
 */
const stringValid = (value: string, minLength?: number, maxLength?: number): boolean => (
  typeof value === 'string'
  && (minLength === undefined || value.length >= minLength)
  && (maxLength === undefined || value.length <= maxLength)
);

/**
 * Verifies if a value is a valid number and is within a range (optional).
 * @param value
 * @param min?
 * @param max?
 * @returns boolean
 */
const numberValid = (value: number, min?: number, max?: number): boolean => (
  typeof value === 'number'
  && (min === undefined || value >= min)
  && (max === undefined || value <= max)
);

/**
 * Verifies if a username meets the following requirements:
 * - Accepts any Alpha Characters (lower and upper case)
 * - Accepts any digits
 * - Accepts - , . and/or _
 * - Can range between 2 and 16 characters in length
 * @param value
 * @returns boolean
 */
const usernameValid = (value: string): boolean => (
  typeof value === 'string'
  && /^[a-zA-Z0-9\-._]{2,16}$/.test(value)
);

/**
 * Verifies if a password meets the following requirements:
 * - Minimum length of 8 and maximum length of 2048
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * @param value
 * @returns boolean
 */
const passwordValid = (value: string): boolean => (
  typeof value === 'string'
  && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,2048}$/.test(value)
);

/**
 * Verifies if a value is a valid authority level.
 * @param value
 * @returns boolean
 */
const authorityValid = (value: IAuthority): value is IAuthority => numberValid(value, 1, 5);

/**
 * Verifies if a value has the correct OTP Token Format.
 * @param value
 * @returns boolean
 */
const otpTokenValid = (value: string): boolean => (
  typeof value === 'string'
  && /^[0-9]{6}$/.test(value)
);

/**
 * Verifies if a value has a correct JWT Format:
 * [Base64-URL Encoded Header].[Base64-URL Encoded Payload].[Signature]
 * @param value
 * @returns boolean
 */
const jwtValid = (value: string): boolean => (
  typeof value === 'string'
  && /^[A-Za-z0-9-_]{2,1000}\.[A-Za-z0-9-_]{2,1000}\.[A-Za-z0-9-_]{2,1000}$/.test(value)
);

/**
 * Verifies if a value is (or could be) an IP Address.
 * @param value
 * @returns boolean
 */
const ipValid = (value: string) => stringValid(value, 5, 300);

/**
 * Verifies if a value is (or could be) notes to be attached to an IP Address.
 * @param value
 * @returns boolean
 */
const ipNotesValid = (value: string) => stringValid(value, 5, 3000);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // implementation
  stringValid,
  numberValid,
  usernameValid,
  passwordValid,
  authorityValid,
  otpTokenValid,
  jwtValid,
  ipValid,
  ipNotesValid,
};
