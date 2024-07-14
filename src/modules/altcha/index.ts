import { addMinutes } from 'date-fns';
import { createChallenge, verifySolution } from 'altcha-lib';
import { encodeError } from 'error-message-utils';
import { ENVIRONMENT } from '../shared/environment/index.js';
import { stringValid } from '../shared/validations/index.js';
import { IAltchaService, IChallenge } from './types.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Altcha Service Factory
 * Generates the object in charge of creating and verifying Altcha Challenges for public endpoints.
 * @returns IAltchaService
 */
const altchaServiceFactory = (): IAltchaService => {
  /* **********************************************************************************************
   *                                          PROPERTIES                                          *
   ********************************************************************************************** */

  // the secret key that will be used to sign the challenges with HMAC
  const __SECRET = ENVIRONMENT.ALTCHA_SECRET;

  // the number of minutes a challenge is valid for
  const __CHALLENGE_DURATION = 5;





  /* **********************************************************************************************
   *                                            ACTIONS                                           *
   ********************************************************************************************** */

  /**
   * Creates an Altcha Challenge ready to be sent to the client.
   * @returns Promise<IChallenge>
   */
  const create = (): Promise<IChallenge> => createChallenge({
    algorithm: 'SHA-256',
    hmacKey: __SECRET,
    expires: addMinutes(new Date(), __CHALLENGE_DURATION),
    maxNumber: 1000000,
    saltLength: 12,
  });

  /**
   * Verifies if a solution to a challenge is valid and has not expired or previously used.
   * @param payload
   * @returns Promise<void>
   * @throws
   * - 2000: the payload has an invalid format
   * - 2001: the solution is invalid or it has expired
   */
  const verify = async (payload: string): Promise<void> => {
    // ensure the payload is a valid string
    if (!stringValid(payload, 100, 1000)) {
      throw new Error(encodeError(`The provided altcha payload '${payload}' has an invalid format. Please try again.`, 2000));
    }

    // proceed to verify the solution
    const result = await verifySolution(payload, __SECRET, true);
    if (!result) {
      throw new Error(encodeError('The solution to the Altcha challenge is invalid or it has expired. Please try again.', 2001));
    }
  };





  /* **********************************************************************************************
   *                                         MODULE BUILD                                         *
   ********************************************************************************************** */
  return Object.freeze({
    // properties
    // ...

    // actions
    create,
    verify,
  });
};





/* ************************************************************************************************
 *                                        GLOBAL INSTANCE                                         *
 ************************************************************************************************ */
const AltchaService = altchaServiceFactory();





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  AltchaService,
};
