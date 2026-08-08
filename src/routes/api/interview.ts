import { createFileRoute } from "@tanstack/react-router";
import { handleInterviewRequest, handleDebugRequest } from "@/lib/interview/handler.server";

export const Route = createFileRoute("/api/interview")({
  server: {
    handlers: {
      POST: ({ request }) => handleInterviewRequest(request),
      GET: ({ request }) => handleDebugRequest(request),
    },
  },
});
