import { NextRequest, NextResponse } from "next/server";

function resolveApiUrl(): string {
  const base =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  return base.replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const headers = new Headers();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    headers.set("x-forwarded-for", forwardedFor);
  }

  const response = await fetch(`${resolveApiUrl()}/auth/captcha`, {
    headers,
    cache: "no-store",
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
