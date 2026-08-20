import { NextRequest } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001";

async function proxyToBackend(request: NextRequest, id: string): Promise<Response> {
  const backendResponse = await fetch(new URL(`/tasks/${id}`, BACKEND_BASE_URL), {
    method: request.method,
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
      "content-type": request.headers.get("content-type") ?? "application/json",
    },
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get("content-type");

  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  if (backendResponse.status === 204 || backendResponse.status === 304) {
    return new Response(null, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  }

  return new Response(await backendResponse.text(), {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return proxyToBackend(request, id);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return proxyToBackend(request, id);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return proxyToBackend(request, id);
}
