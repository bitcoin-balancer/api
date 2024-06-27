import express from 'express';
import morgan from 'morgan';
import { buildResponse } from 'api-response-utils';
import { serverFactory } from './server/server.js';

/* ************************************************************************************************
 *                                       APPLICATION SETUP                                        *
 ************************************************************************************************ */

/**
 * Express Application
 * Initialize the main instance of the Express Application that will be used to start the server.
 */
const app = express();

/**
 * Powered By Header
 * By default, Express sends the 'X-Powered-By' Header in every response. This allows anybody to
 * fingerprint the API and can become a vulnerability.
 */
app.disable('x-powered-by');

/**
 * HTTP Logger
 * Morgan handles the logging of HTTP Request details as well as the senders'
 */
app.use(morgan('combined'));
// Even though the Balancer API sits behind a reverse proxy, Morgan has issues when it comes to
// displaying the sender's IP. More info: https://github.com/expressjs/morgan/issues/214
// app.set("trust proxy", true);





/* ************************************************************************************************
 *                                            ROUTERS                                             *
 ************************************************************************************************ */
/* eslint-disable import/first */
import { PingRouter } from './modules/ping/ping.router.js';

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
