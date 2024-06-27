import { IAuthority } from '../../auth/types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Verifies if a username meets the following requirements:
 * - Accepts any Alpha Characters (lower and upper case)
 * - Accepts any digits
 * - Accepts - , . and/or _
 * - Can range between 2 and 16 characters in length
 * @param username
 * @returns boolean
 */
const usernameValid = (username: string): boolean => (
  typeof username === 'string'
  && /^[a-zA-Z0-9\-._]{2,16}$/.test(username)
);

/**
 * Verifies if a password meets the following requirements:
 * - Minimum length of 8 and maximum length of 2048
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * @param password
 * @returns boolean
 */
const passwordValid = (password: string): boolean => (
  typeof password === 'string'
  && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,2048}$/.test(password)
);

/**
 * Verifies if a value is a valid authority level.
 * @param authority
 * @returns boolean
 */
const authorityValid = (authority: IAuthority): authority is IAuthority => (
  typeof authority === 'number'
  && authority >= 1
  && authority <= 5
);

/**
 * Verifies if a value has the correct OTP Token Format.
 * @param token
 * @returns boolean
 */
const otpTokenValid = (token: string): boolean => (
  typeof token === 'string'
  && /^[0-9]{6}$/.test(token)
);




/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // implementation
  usernameValid,
  passwordValid,
  authorityValid,
  otpTokenValid,
};
