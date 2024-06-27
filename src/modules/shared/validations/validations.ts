

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
const usernameValid = (username: string): boolean => typeof username === 'string' && username.length > 0 && /^[a-zA-Z0-9\-._]{2,16}$/.test(username);





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  // implementation
  usernameValid,
};
