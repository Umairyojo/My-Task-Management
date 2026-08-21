import { NextRequest } from "next/server";
import { proxyTaskRequest } from "./task-proxy";

export async function GET(request: NextRequest): Promise<Response> {
  return proxyTaskRequest(request, "");
}

export async function POST(request: NextRequest): Promise<Response> {
  return proxyTaskRequest(request, "");
}
