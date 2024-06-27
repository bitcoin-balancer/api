import express from 'express';
import { buildResponse } from 'api-response-utils';
import { serverFactory } from './server/server.js';

// routers
import { PingRouter } from './modules/ping/ping.router.js';

/**
 * Express Application
 * ...
 */
const app = express();


/* ************************************************************************************************
 *                                            ROUTERS                                             *
 ************************************************************************************************ */
app.use('/ping', PingRouter);

// custom 404
app.use((req, res) => {
  res.status(404).json(buildResponse(undefined, 'The route you are looking for wasn\'t found in the API. Please review the docs before trying again.'));
});





/* ************************************************************************************************
 *                                     SERVER INITIALIZATION                                      *
 ************************************************************************************************ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
serverFactory(app).then((server) => {
  // ...
});
