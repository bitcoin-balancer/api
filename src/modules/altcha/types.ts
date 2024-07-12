import { Challenge, Payload } from 'altcha-lib/types';


/* ************************************************************************************************
 *                                            SERVICE                                             *
 ************************************************************************************************ */

/**
 * Altcha Service
 * Object in charge of creating and verifying Altcha Challenges for public endpoints.
 */
type IAltchaService = {
  // properties
  // ...

  // actions
  create: () => Promise<IChallenge>;
  verify: (payload: string) => Promise<void>;
};





/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Challenge
 * The challenge record created when invoking createChallenge.
 */
type IChallenge = Challenge;

/**
 * Payload
 * The payload can be a Base64-encoded JSON payload (as submitted by the widget) or an object.
 */
type IPayload = Payload;





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  // service
  IAltchaService,

  // types
  IChallenge,
  IPayload,
};
