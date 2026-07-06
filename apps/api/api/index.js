const path = require('path');
const moduleLib = require('module');
const serverlessExpress = require('@vendia/serverless-express');

const apiRoot = path.join(__dirname, '..');
const repoRoot = path.join(__dirname, '../..');

moduleLib.globalPaths.push(
  path.join(apiRoot, 'node_modules'),
  path.join(repoRoot, 'node_modules'),
);

/** @type {import('@vendia/serverless-express').Handler | undefined} */
let cachedHandler;

/** @type {import('@vercel/node').VercelApiHandler} */
module.exports = async (req, res) => {
  try {
    if (!cachedHandler) {
      const { createApp } = require(path.join(apiRoot, 'dist/create-app'));
      const nestApp = await createApp();
      await nestApp.init();
      const expressApp = nestApp.getHttpAdapter().getInstance();
      cachedHandler = serverlessExpress({ app: expressApp });
    }

    return cachedHandler(req, res);
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
