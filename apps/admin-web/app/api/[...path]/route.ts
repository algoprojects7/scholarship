import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy-to-backend";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handler(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params;
  return proxyToBackend(request, path);
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
