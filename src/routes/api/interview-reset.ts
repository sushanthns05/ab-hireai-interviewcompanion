import { createFileRoute } from "@tanstack/react-router";
import { handleResetRequest } from "@/lib/interview/handler.server";

export const Route = createFileRoute("/api/interview-reset")({
  server: {
    handlers: {
      POST: ({ request }) => handleResetRequest(request),
    },
  },
});
