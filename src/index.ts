import express from 'express';
import { buildResponse } from 'api-response-utils';

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



/**
 * Server Initialization
 * ...
 */
const server = app.listen(5075);
console.log('Balancer API Initialized');
console.log('Running: v1.0.0');
console.log('Port: 5075');
console.log('Production: false');
