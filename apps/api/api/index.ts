import serverlessExpress from '@vendia/serverless-express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../dist/create-app';

type ServerlessHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => void | Promise<void>;

let cachedHandler: ServerlessHandler | undefined;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!cachedHandler) {
    const nestApp = await createApp();
    await nestApp.init();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    cachedHandler = serverlessExpress({
      app: expressApp,
    }) as ServerlessHandler;
  }

  return cachedHandler(req, res);
}
