import { NextRequest } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001";
const BACKEND_BASE_URLS = [
  BACKEND_BASE_URL.replace(/\/+$/, ""),
  BACKEND_BASE_URL.replace(/\/+$/, "").replace("localhost", "127.0.0.1"),
].filter((value, index, values) => values.indexOf(value) === index);

function buildProjectProxyUrl(baseUrl: string): string {
  return `${baseUrl}/projects`;
}

async function proxyToBackend(request: NextRequest): Promise<Response> {
  const requestBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  let lastError: unknown = null;

  for (const backendBaseUrl of BACKEND_BASE_URLS) {
    const backendUrl = buildProjectProxyUrl(backendBaseUrl);

    try {
      const backendResponse = await fetch(backendUrl, {
        method: request.method,
        headers: {
          accept: request.headers.get("accept") ?? "application/json",
          "content-type":
            request.headers.get("content-type") ?? "application/json",
        },
        body: requestBody,
        cache: "no-store",
      });

      if (!backendResponse.ok) {
        console.error(
          `[projects proxy] ${request.method} ${backendUrl} -> ${backendResponse.status}`,
        );
      }

      const responseBody = await backendResponse.text();

      const responseHeaders = new Headers();
      const contentType = backendResponse.headers.get("content-type");

      if (contentType) {
        responseHeaders.set("content-type", contentType);
      }

      return new Response(responseBody, {
        status: backendResponse.status,
        headers: responseHeaders,
      });
    } catch (error) {
      lastError = error;
      console.error(
        `[projects proxy] ${request.method} ${backendUrl} failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.error(
    `[projects proxy] ${request.method} failed after ${BACKEND_BASE_URLS.length} attempt(s):`,
    lastError instanceof Error ? lastError.message : lastError,
  );

  return Response.json(
    { error: "Unable to reach the backend service." },
    { status: 502 },
  );
}

export async function GET(request: NextRequest): Promise<Response> {
  return proxyToBackend(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return proxyToBackend(request);
}
