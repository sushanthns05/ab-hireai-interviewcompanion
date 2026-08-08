import { createFileRoute } from "@tanstack/react-router";
import { handleInterviewRequest, handleDebugRequest } from "@/lib/interview/handler.server";

// Mirror of POST /api/interview that stays reachable on published sites
// (the /api/public/* prefix bypasses site auth). No authentication is required
// by the spec; the handler validates every input itself.
export const Route = createFileRoute("/api/public/interview")({
  server: {
    handlers: {
      POST: ({ request }) => handleInterviewRequest(request),
      GET: ({ request }) => handleDebugRequest(request),
    },
  },
});
