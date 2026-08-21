import { NextRequest } from "next/server";

const configuredBackendBaseUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001";

const backendBaseUrls = [
  configuredBackendBaseUrl.replace(/\/+$/, ""),
  configuredBackendBaseUrl.replace(/\/+$/, "").replace("localhost", "127.0.0.1"),
].filter((value, index, values) => values.indexOf(value) === index);

export async function proxyTaskRequest(
  request: NextRequest,
  path: string,
): Promise<Response> {
  const requestBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  let lastError: unknown = null;

  for (const baseUrl of backendBaseUrls) {
    try {
      const backendResponse = await fetch(new URL(`/tasks${path}`, baseUrl), {
        method: request.method,
        headers: {
          accept: request.headers.get("accept") ?? "application/json",
          "content-type": request.headers.get("content-type") ?? "application/json",
        },
        body: requestBody,
        cache: "no-store",
      });

      const headers = new Headers();
      const contentType = backendResponse.headers.get("content-type");

      if (contentType) {
        headers.set("content-type", contentType);
      }

      if (backendResponse.status === 204 || backendResponse.status === 304) {
        return new Response(null, { status: backendResponse.status, headers });
      }

      return new Response(await backendResponse.text(), {
        status: backendResponse.status,
        headers,
      });
    } catch (error) {
      lastError = error;
    }
  }

  console.error(
    `[tasks proxy] ${request.method} /tasks${path} failed:`,
    lastError instanceof Error ? lastError.message : lastError,
  );

  return Response.json(
    { error: "Unable to reach the backend service." },
    { status: 502 },
  );
}
