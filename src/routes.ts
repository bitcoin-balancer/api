import { Express } from 'express';
import { AltchaRouter } from './modules/altcha/router.js';
import { APIErrorRouter } from './modules/api-error/router.js';
import { UserRouter } from './modules/auth/user/router.js';
import { JWTRouter } from './modules/auth/jwt/router.js';
import { CandlestickRouter } from './modules/candlestick/router.js';
import { DataJoinRouter } from './modules/data-join/router.js';
import { DatabaseRouter } from './modules/database/router.js';
import { IPBlacklistRouter } from './modules/ip-blacklist/router.js';
import { MarketStateRouter } from './modules/market-state/router.js';
import { NotificationRouter } from './modules/notification/router.js';
import { PositionRouter } from './modules/position/router.js';
import { ServerRouter } from './modules/server/router.js';
import { PingRouter } from './modules/ping/router.js';

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
  app.use('/candlestick', CandlestickRouter);
  app.use('/data-join', DataJoinRouter);
  app.use('/database', DatabaseRouter);
  app.use('/ip-blacklist', IPBlacklistRouter);
  app.use('/market-state', MarketStateRouter);
  app.use('/notification', NotificationRouter);
  app.use('/position', PositionRouter);
  app.use('/server', ServerRouter);
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
