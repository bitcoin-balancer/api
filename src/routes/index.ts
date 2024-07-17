import { Express } from 'express';
import { AltchaRouter } from '../modules/altcha/router.js';
import { APIErrorRouter } from '../modules/api-error/router.js';
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
  app.use('/api-errors', APIErrorRouter);
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
