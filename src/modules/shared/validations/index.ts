import { version as uuidVersion, validate as uuidValidate } from 'uuid';
import { isInteger } from 'bignumber-utils';
import { IObject } from '../types.js';
import { IAuthority } from '../../auth/user/types.js';


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
const stringValid = (value: any, minLength?: number, maxLength?: number): value is string => (
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
const numberValid = (value: any, min?: number, max?: number): value is number => (
  typeof value === 'number'
  && (min === undefined || value >= min)
  && (max === undefined || value <= max)
);

/**
 * Verifies if a value is a valid integer and is within a range (optional). If a range is not
 * provided, it will use the properties Number.MIN_SAFE_INTEGER & Number.MAX_SAFE_INTEGER.
 * @param value
 * @param min?
 * @param max?
 * @returns boolean
 */
const integerValid = (value: any, min?: number, max?: number): value is number => (
  numberValid(value, min ?? Number.MIN_SAFE_INTEGER, max ?? Number.MAX_SAFE_INTEGER)
  && isInteger(value)
);

/**
 * Verifies if a value is an actual object. It also validates if it has keys (optional).
 * @param value
 * @param allowEmpty?
 * @returns boolean
 */
const objectValid = (value: any, allowEmpty?: boolean): value is IObject => (
  Boolean(value)
  && typeof value === 'object'
  && !Array.isArray(value)
  && (allowEmpty || Object.keys(value).length > 0)
);

/**
 * Verifies if a value is an array. It also validates if it has elements inside (optional)
 * @param value
 * @param allowEmpty?
 * @returns boolean
 */
const arrayValid = (value: any, allowEmpty?: boolean): value is Array<any> => (
  Array.isArray(value)
  && (allowEmpty || value.length > 0)
);

/**
 * Verifies if a value is a valid unix timestamp in milliseconds. The smallest value is set for
 * the beginning of the Unix epoch (January 1st, 1970 - 14400000) while the largest value is based
 * on the numeric limit established by JavaScript (9007199254740991).
 * @param value
 * @returns boolean
 */
const timestampValid = (value: any): value is number => (
  integerValid(value, 14400000, Number.MAX_SAFE_INTEGER)
);

/**
 * Verifies if a value is a UUID Version 4.
 * @param value
 * @returns boolean
 */
const uuidValid = (value: any): value is string => uuidValidate(value) && uuidVersion(value) === 4;

/**
 * Verifies if a nickname meets the following requirements:
 * - Accepts any Alpha Characters (lower and upper case)
 * - Accepts any digits
 * - Accepts - , . and/or _
 * - Can range between 2 and 16 characters in length
 * @param value
 * @returns boolean
 */
const nicknameValid = (value: any): value is string => (
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
const passwordValid = (value: any): value is string => (
  typeof value === 'string'
  && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,2048}$/.test(value)
);

/**
 * Verifies if a value is a valid authority level.
 * @param value
 * @returns boolean
 */
const authorityValid = (value: any): value is IAuthority => numberValid(value, 1, 5);

/**
 * Verifies if a value has the correct OTP Secret Format.
 * @param value
 * @returns boolean
 */
const otpSecretValid = (value: any): value is string => (
  typeof value === 'string'
  && /^[0-9a-zA-Z]{16,64}$/.test(value)
);

/**
 * Verifies if a value has the correct OTP Token Format.
 * @param value
 * @returns boolean
 */
const otpTokenValid = (value: any): value is string => (
  typeof value === 'string'
  && /^[0-9]{6}$/.test(value)
);

/**
 * Verifies if a value has a correct JWT Format:
 * [Base64-URL Encoded Header].[Base64-URL Encoded Payload].[Signature]
 * @param value
 * @returns boolean
 */
const jwtValid = (value: any): value is string => (
  typeof value === 'string'
  && /^[A-Za-z0-9-_]{2,1000}\.[A-Za-z0-9-_]{2,1000}\.[A-Za-z0-9-_]{2,1000}$/.test(value)
);

/**
 * Verifies if a value is (or could be) an IP Address.
 * @param value
 * @returns boolean
 */
const ipValid = (value: any): value is string => stringValid(value, 5, 300);

/**
 * Verifies if a value is (or could be) notes to be attached to an IP Address.
 * @param value
 * @returns boolean
 */
const ipNotesValid = (value: any): value is string => stringValid(value, 5, 3000);

/**
 * Verifies if a value is a value that complies with semantic versioning.
 * @param value
 * @returns boolean
 */
const semverValid = (value: any): value is string => (
  typeof value === 'string'
  && /^[0-9]{1,5}\.[0-9]{1,5}\.[0-9]{1,5}$/.test(value)
);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  stringValid,
  numberValid,
  integerValid,
  objectValid,
  arrayValid,
  timestampValid,
  uuidValid,
  nicknameValid,
  passwordValid,
  authorityValid,
  otpSecretValid,
  otpTokenValid,
  jwtValid,
  ipValid,
  ipNotesValid,
  semverValid,
};
