const serverless = require('serverless-http');
const { app } = require('../dist/app.js');

// Create the serverless handler
const handler = serverless(app);

module.exports = handler;