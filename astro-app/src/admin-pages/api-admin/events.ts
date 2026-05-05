import type { APIRoute } from "astro";
import { getEvents } from "../../../../src/db/admin-queries";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // If you still want to restrict this API to DEV mode, keep this guard.
  if (!import.meta.env.DEV) {
    return new Response(null, { status: 404 });
  }

  const url = new URL(request.url);
  // Check if client is requesting a Server-Sent Events (SSE) stream
  const acceptHeader = request.headers.get("accept");

  if (
    acceptHeader === "text/event-stream" ||
    url.searchParams.get("stream") === "true"
  ) {
    // Keep the SSE logic for real-time updates on the dashboard if desired,
    // but update it to use the new core query.
    const stream = new ReadableStream({
      start(controller) {
        const push = (data: unknown) => {
          try {
            // Check if controller is still open before enqueuing
            // We use a try/catch as the internal state isn't directly exposed
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (e) {
            // If the controller is closed (e.g. client disconnected), stop intervals
            clearInterval(interval);
            clearInterval(keepAlive);
          }
        };

        // Poll for changes
        const interval = setInterval(() => {
          const { data } = getEvents(undefined, 1, 50, "added_at", "DESC");
          push(data);
        }, 5000); // Polling every 5s

        // Push immediately on connect so we don't wait 5s
        const { data } = getEvents(undefined, 1, 50, "added_at", "DESC");
        push(data);

        // Keep connection alive with comments if idle too long
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(`: keep-alive\n\n`);
          } catch (e) {
            clearInterval(interval);
            clearInterval(keepAlive);
          }
        }, 30000);

        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          clearInterval(keepAlive);
          try {
            controller.close();
          } catch (e) {} // Ignore if already closed
        });
      },
      cancel() {
        // Cleanup handled by abort listener, but cancel hook is good practice
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Standard RESTful JSON Response (For CLI testing and static fetches)
  const venueId = url.searchParams.get("venue") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const sortCol = (url.searchParams.get("sortCol") ) || "date";
  const sortDir = (url.searchParams.get("sortDir") ) || "DESC";

  const { data, total } = getEvents(venueId, page, limit, sortCol, sortDir);

  return new Response(JSON.stringify({ data, total, page, limit }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
