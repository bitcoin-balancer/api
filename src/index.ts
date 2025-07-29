import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ENVIRONMENT } from './modules/shared/environment/index.js';
import { mountRoutes } from './routes.js';
import { APIService } from './modules/shared/api/index.js';

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
 * Reverse Proxy
 * If the environment variable HAS_TUNNEL_TOKEN is set to true, it means that Balancer's platform
 * is behind a Cloudflare Tunnel (Reverse Proxy). This setting is mostly to avoid getting an
 * internal IP address of the reverse proxy instead of the client's IP Address.
 * https://expressjs.com/en/guide/behind-proxies.html
 *
 * The numeric value is set based on the number of proxies between the user and the server. To find
 * the correct number of, create a test endpoint that shows the client IP and compare it with your
 * public IP. If the IP is not correct, keep increasing the number until it is.
 * Make sure to turn the VPN off when performing this test as some VPN vendors give you a different
 * IP for every request.
 * https://express-rate-limit.mintlify.app/reference/error-codes#err-erl-permissive-trust-proxy
 * https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues
 */
if (ENVIRONMENT.HAS_TUNNEL_TOKEN) {
  app.set('trust proxy', 1);
}

/**
 * HTTP Logger
 * Morgan handles the logging of HTTP Request details as well as the senders'.
 * https://github.com/expressjs/morgan
 */
app.use(morgan('combined'));

/**
 * Body Parser
 * Parses the request bodies in a middleware before it touches the handlers. The data is available
 * under the req.body property. For security reasons, it controls the request's body size.
 * https://github.com/expressjs/body-parser
 */
app.use(bodyParser.json({ type: 'application/json', limit: '100kb' }));

/**
 * Cookie Parser
 * Parses the Cookie header and populate the req.cookies property with an object keyed by the cookie
 * names. When passing a secret, it will unsign and validate any signed cookie values and move those
 * name value pairs from req.cookies into req.signedCookies.  A signed cookie is a cookie that has a
 * value prefixed with s:. Signed cookies that fail signature validation will have the value false
 * instead of the tampered value.
 * https://github.com/expressjs/cookie-parser
 */
app.use(cookieParser(ENVIRONMENT.COOKIE_SECRET));

/**
 * CORS
 * Enables Cross Origin Resource Sharing so the API's resources can be accessed and/or managed from
 * any origin.
 * https://github.com/expressjs/cors
 */
app.use(
  cors({
    origin: ENVIRONMENT.GUI_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

/* ************************************************************************************************
 *                                             ROUTES                                             *
 ************************************************************************************************ */
mountRoutes(app);

/* ************************************************************************************************
 *                                       API INITIALIZATION                                       *
 ************************************************************************************************ */
APIService.initialize(app).then(() => {
  // ...
});
