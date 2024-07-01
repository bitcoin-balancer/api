import { rateLimit, Options } from 'express-rate-limit';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Default Options
 * The following defaults are provided by the library. The message has been customized to prevent
 * fingerprinting.
 *
 * The Rate Limit Middlewares are designed to be used on a per route basis in order to meet
 * any requirements. Actions that consume a significant amount of resources or endpoints that are
 * public, should make use of higher risk limits.
 */
const options: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  statusCode: 429,
  message: 'You have exceeded your API request limit. Please wait for a few minutes before trying again.',
};

/**
 * Very Low Risk
 * Limit each IP to 400 requests per window (every 15 minutes)
 */
const veryLowRiskLimit = rateLimit({ ...options, limit: 400 });

/**
 * Low Risk
 * Limit each IP to 200 requests per window (every 15 minutes)
 */
const lowRiskLimit = rateLimit({ ...options, limit: 200 });

/**
 * Medium Risk
 * Limit each IP to 40 requests per window (every 15 minutes)
 */
const mediumRiskLimit = rateLimit({ ...options, limit: 40 });

/**
 * High Risk
 * Limit each IP to 20 requests per window (every 15 minutes)
 */
const highRiskLimit = rateLimit({ ...options, limit: 20 });

/**
 * Very High Risk
 * Limit each IP to 10 requests per window (every 15 minutes)
 */
const veryHighRiskLimit = rateLimit({ ...options, limit: 10 });





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  veryLowRiskLimit,
  lowRiskLimit,
  mediumRiskLimit,
  highRiskLimit,
  veryHighRiskLimit,
};
