import { getEventDetails } from "@open-setlist/db/admin-queries";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const id = params.id;

	if (!id) {
		return new Response(JSON.stringify({ error: "Missing event ID" }), {
			status: 400,
		});
	}

	const event = getEventDetails(id);

	if (!event) {
		return new Response(JSON.stringify({ error: "Event not found" }), {
			status: 404,
		});
	}

	return new Response(JSON.stringify(event), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
