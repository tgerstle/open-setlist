import { getHealthStats } from "@open-setlist/db/admin-queries";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
	const stats = getHealthStats();

	return new Response(JSON.stringify(stats), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
