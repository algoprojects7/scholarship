const path = require('path');
const moduleLib = require('module');

const apiRoot = path.join(__dirname, '..');
const repoRoot = path.join(__dirname, '../..');

moduleLib.globalPaths.push(
  path.join(apiRoot, 'node_modules'),
  path.join(repoRoot, 'node_modules'),
);

/** @type {import('express').Express | undefined} */
let cachedExpressApp;

/** @type {import('@vercel/node').VercelApiHandler} */
module.exports = async (req, res) => {
  try {
    if (!cachedExpressApp) {
      const { createApp } = require(path.join(apiRoot, 'dist/create-app'));
      const nestApp = await createApp();
      await nestApp.init();
      cachedExpressApp = nestApp.getHttpAdapter().getInstance();
    }

    return cachedExpressApp(req, res);
  } catch (error) {
    console.error('API bootstrap failed:', error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          statusCode: 500,
          message:
            error instanceof Error ? error.message : 'API bootstrap failed',
        }),
      );
    }
  }
};
