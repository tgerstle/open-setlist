import { getEvents } from "@open-setlist/db/admin-queries";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const showPast = url.searchParams.get("past") === "true";
	const currentDate = new Date().toISOString().split("T")[0];

	// If showing past, perhaps fetch a large amount, or all
	// For demo/simplicity based on previous logic returning up to 1000
	const startDate = showPast ? undefined : currentDate;

	// Note: For a production app we should probably paginate this, but to
	// match the previous behavior of returning 1000 items to client-side filter:
	const { data: rawShows } = getEvents(
		undefined,
		1,
		1000,
		"date",
		"ASC",
		startDate,
	);

	return new Response(JSON.stringify(rawShows), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
