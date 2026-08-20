import { NextRequest } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001";

async function proxyToBackend(request: NextRequest): Promise<Response> {
  const backendResponse = await fetch(new URL("/projects", BACKEND_BASE_URL), {
    method: request.method,
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
      "content-type": request.headers.get("content-type") ?? "application/json",
    },
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text(),
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get("content-type");

  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  return new Response(await backendResponse.text(), {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  return proxyToBackend(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return proxyToBackend(request);
}
