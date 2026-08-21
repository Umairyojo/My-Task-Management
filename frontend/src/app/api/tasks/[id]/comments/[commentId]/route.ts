import { NextRequest } from "next/server";
import { proxyTaskRequest } from "../../../task-proxy";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> },
): Promise<Response> {
  const { id, commentId } = await context.params;
  return proxyTaskRequest(request, `/${id}/comments/${commentId}`);
}
