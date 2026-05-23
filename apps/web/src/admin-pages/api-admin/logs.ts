import { getAuditLogs } from "@open-setlist/db/admin-queries";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const limit = parseInt(url.searchParams.get("limit") || "50", 10);

	const logs = getAuditLogs(limit);

	return new Response(JSON.stringify(logs), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
