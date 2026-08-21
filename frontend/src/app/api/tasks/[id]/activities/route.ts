import { NextRequest } from "next/server";
import { proxyTaskRequest } from "../../task-proxy";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return proxyTaskRequest(request, `/${id}/activities`);
}
