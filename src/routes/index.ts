import { Express } from 'express';
import { AltchaRouter } from '../modules/altcha/router.js';
import { APIErrorRouter } from '../modules/api-error/router.js';
import { UserRouter } from '../modules/auth/user/router.js';
import { JWTRouter } from '../modules/auth/jwt/router.js';
import { IPBlacklistRouter } from '../modules/ip-blacklist/router.js';
import { PingRouter } from '../modules/ping/router.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Mounts all the API Routes on an Express Instance.
 * @param app
 */
const mountRoutes = (app: Express): void => {
  app.use('/altcha', AltchaRouter);
  app.use('/api-error', APIErrorRouter);
  app.use('/auth/user', UserRouter);
  app.use('/auth/jwt', JWTRouter);
  app.use('/ip-blacklist', IPBlacklistRouter);
  app.use('/ping', PingRouter);

  // custom 404
  app.use((req, res) => {
    res.status(404).send('The route you are looking for could not be matched. Please review the docs before trying again.');
  });
};





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export {
  mountRoutes,
};
