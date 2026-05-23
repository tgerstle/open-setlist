import { getVenuesOverview } from "@open-setlist/db/admin-queries";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
	const venues = getVenuesOverview();

	return new Response(JSON.stringify(venues), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
