const serverlessExpress = require('@vendia/serverless-express');
const { createApp } = require('../dist/create-app');

/** @type {import('@vendia/serverless-express').Handler | undefined} */
let cachedHandler;

/** @type {import('@vercel/node').VercelApiHandler} */
module.exports = async (req, res) => {
  if (!cachedHandler) {
    const nestApp = await createApp();
    await nestApp.init();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    cachedHandler = serverlessExpress({ app: expressApp });
  }

  return cachedHandler(req, res);
};
