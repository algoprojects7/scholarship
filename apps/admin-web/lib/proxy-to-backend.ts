import { NextRequest, NextResponse } from "next/server";
import { resolveBackendApiUrl } from "@/lib/resolve-api-base";

const FORWARDED_REQUEST_HEADERS = [
  "authorization",
  "content-type",
  "x-portal",
  "x-forwarded-for",
  "cookie",
] as const;

function buildProxyHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  if (!headers.has("authorization")) {
    const token = request.cookies.get("token")?.value?.trim();
    if (token) {
      try {
        headers.set("authorization", `Bearer ${decodeURIComponent(token)}`);
      } catch {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
  }

  return headers;
}

function rewriteSetCookieForFrontend(setCookie: string): string {
  return setCookie.replace(/;\s*Path=\/auth\b/gi, "; Path=/");
}

export async function proxyToBackend(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const targetUrl = `${resolveBackendApiUrl()}/${pathSegments.join("/")}${request.nextUrl.search}`;

  const headers = buildProxyHeaders(request);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(targetUrl, init);

  const responseHeaders = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  const contentDisposition = response.headers.get("content-disposition");
  if (contentDisposition) {
    responseHeaders.set("content-disposition", contentDisposition);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    responseHeaders.set("content-length", contentLength);
  }

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    responseHeaders.set("set-cookie", rewriteSetCookieForFrontend(setCookie));
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
