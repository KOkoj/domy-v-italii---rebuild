const serverless = require('serverless-http');

// Dynamic import for ES modules
const handler = async (req, res) => {
  const { app } = await import('../dist/app.js');
  return serverless(app)(req, res);
};

module.exports = handler;

