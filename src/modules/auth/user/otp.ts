import { authenticator } from 'otplib';

/* ************************************************************************************************
 *                                         CONFIGURATION                                          *
 ************************************************************************************************ */

/**
 * Authenticator Options
 * All the available options can be found in the following URL:
 * https://github.com/yeojz/otplib/blob/master/README.md#available-options
 *
 * - window: number|[number, number] -> Tokens in the previous and future x-windows that should be
 * considered valid. If integer, same value will be used for both or use Tuple: [past, future]
 * The reason this property was set to 2 is because it's bad for UX when the user tries to use a
 * token right after it expires. By setting the accepted window to 2, the UX is improved and the
 * impact on security is low as it only extends the token's validity by ~1 minute for past tokens
 * and 1 minute for future tokens, instead of 30 seconds (default).
 * - step: number -> The time step in seconds. The Google Authenticator implementation rotates
 * tokens every 30 seconds.
 */
authenticator.options = { window: 2, step: 30 };





/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Generates a secret that can be used to initialize an OTP instance and generate tokens. It can
 * be used in apps like Google Authenticator to issue tokens.
 * @returns string
 */
const generateOTPSecret = (): string => authenticator.generateSecret();

/**
 * Checks if a given TOTP token matches the generated token at the given epoch (default to current
 * time).
 * @param token
 * @param secret
 * @returns boolean
 */
const checkOTPToken = (token: string, secret: string): boolean => {
  try {
    return authenticator.check(token, secret);
  } catch (e) {
    return false;
  }
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  generateOTPSecret,
  checkOTPToken,
};
