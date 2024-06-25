import process from 'node:process';
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




/*
 * TEARDOWN
 */
const asyncTearDown = async () => new Promise((resolve) => {
  setTimeout(resolve, 1000);
});
const closeServer = (): Promise<void> => new Promise((resolve, reject) => {
  server.close((error: Error | undefined) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
});
async function closeGracefully(signal: 'SIGINT' | 'SIGTERM') {
  console.log(`Received signal to terminate: ${signal}`);
  await asyncTearDown();
  await closeServer();
  process.kill(process.pid, signal);
}
process.once('SIGINT', closeGracefully);
process.once('SIGTERM', closeGracefully);
