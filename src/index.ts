import express from 'express';
import { buildResponse } from 'api-response-utils';
import { serverFactory } from './server/server.js';

/**
 * Express Application
 * ...
 */
const app = express();



/**
 * Routes
 * ...
 */
app.get('/', (req, res) => {
  res.json(buildResponse('Welcome to Balancer API!'));
});





/* ************************************************************************************************
 *                                     SERVER INITIALIZATION                                      *
 ************************************************************************************************ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
serverFactory(app).then((server) => {
  // ...
});
