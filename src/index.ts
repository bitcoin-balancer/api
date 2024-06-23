import express from 'express';

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
  res.send('hello world');
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
