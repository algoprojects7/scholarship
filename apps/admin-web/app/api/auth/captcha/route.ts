import { NextRequest, NextResponse } from "next/server";
import { resolveBackendApiUrl } from "@/lib/resolve-api-base";

export async function GET(request: NextRequest) {
  const headers = new Headers();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    headers.set("x-forwarded-for", forwardedFor);
  }

  const response = await fetch(`${resolveBackendApiUrl()}/auth/captcha`, {
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
