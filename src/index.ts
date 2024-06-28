import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import requestIp from 'request-ip';
import { buildResponse } from 'api-response-utils';
import { API } from './modules/shared/api/api.js';

/* ************************************************************************************************
 *                                       APPLICATION SETUP                                        *
 ************************************************************************************************ */

/**
 * Express Application
 * Initialize the main instance of the Express Application that will be used to start the server.
 */
const app = express();



/**
 * Helmet
 * Improves the security of the API by setting a series of HTTP Response Headers.
 * https://github.com/helmetjs/helmet
 */
app.use(helmet());



/**
 * Powered By Header
 * By default, Express sends the 'X-Powered-By' Header in every response. This allows anybody to
 * fingerprint the API and can become a vulnerability.
 */
app.disable('x-powered-by');



/**
 * HTTP Logger
 * Morgan handles the logging of HTTP Request details as well as the senders'.
 * https://github.com/expressjs/morgan
 */
app.use(morgan('combined'));
// Even though the Balancer API sits behind a reverse proxy, Morgan has issues when it comes to
// displaying the sender's IP. More info: https://github.com/expressjs/morgan/issues/214
// app.set("trust proxy", true);



/**
 * Request IP
 * Retrieving the request sender's IP can be challenging, especially when hiding behind a reverse
 * proxy server like nginx or Cloudflare Tunnel. The request-ip package simplifies this process as
 * it scans through the headers in order to determine the client's IP. The middleware adds the
 * clientIp property to the request with the IP (string) or null in case it cannot determine the IP.
 * https://github.com/pbojinov/request-ip
 */
app.use(requestIp.mw());





/* ************************************************************************************************
 *                                            ROUTERS                                             *
 ************************************************************************************************ */
/* eslint-disable import/first */
import { PingRouter } from './modules/ping/ping.router.js';

app.use('/ping', PingRouter);

// custom 404
app.use((req, res) => {
  res.status(404).json(buildResponse(undefined, 'The route you are looking for could not be matched. Please review the docs before trying again.'));
});





/* ************************************************************************************************
 *                                       API INITIALIZATION                                       *
 ************************************************************************************************ */
API.initialize(app).then(() => {
  // ...
});
