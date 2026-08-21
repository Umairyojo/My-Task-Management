import { NextRequest } from "next/server";
import { proxyTaskRequest } from "../../../task-proxy";

type RouteContext = { params: Promise<{ id: string; subtaskId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
  const { id, subtaskId } = await context.params;
  return proxyTaskRequest(request, `/${id}/subtasks/${subtaskId}`);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
  const { id, subtaskId } = await context.params;
  return proxyTaskRequest(request, `/${id}/subtasks/${subtaskId}`);
}
