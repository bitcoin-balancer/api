import { addMinutes } from 'date-fns';
import { createChallenge, verifySolution } from 'altcha-lib';
import { encodeError } from 'error-message-utils';
import { IRecord } from '../shared/types.js';
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

  // the list of successfully solved challenges
  const __solvedChallenges: IRecord<boolean> = {};





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
   */
  const verify = async (payload: string): Promise<void> => {
    // ensure the payload is a valid string
    if (!stringValid(payload, 100, 1000)) {
      throw new Error(encodeError(`The provided altcha payload '${payload}' has an invalid format. Please try again.`, 1000));
    }

    // ensure the solved challenge hasn't already been used
    if (__solvedChallenges[payload]) {
      throw new Error(encodeError(`The provided altcha payload '${payload}' has already been used. Please try again.`, 1001));
    }

    // proceed to verify the solution
    const result = await verifySolution(payload, __SECRET, true);
    if (!result) {
      throw new Error(encodeError('The solution to the Altcha challenge is invalid or it has expired. Please try again.', 1002));
    }

    // add the payload to the solved list
    __solvedChallenges[payload] = true;
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
