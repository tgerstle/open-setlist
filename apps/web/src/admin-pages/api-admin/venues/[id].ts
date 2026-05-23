import type { APIRoute } from "astro";

export const prerender = false;

import {
	getVenueDetails,
	updateVenueMetadata,
} from "@open-setlist/db/admin-queries";

export const PATCH: APIRoute = async ({ request, params }) => {
	const { id } = params;
	if (!id) {
		return new Response(JSON.stringify({ error: "Missing venue ID" }), {
			status: 400,
		});
	}

	try {
		const payload = await request.json();

		// Only extract the fields we allow editing
		const updateData: Record<string, string | undefined> = {};
		if (payload.address !== undefined) updateData.address = payload.address;
		if (payload.website_url !== undefined)
			updateData.website_url = payload.website_url;
		if (payload.timezone !== undefined) updateData.timezone = payload.timezone;
		if (payload.coordinates !== undefined)
			updateData.coordinates = payload.coordinates;

		const success = updateVenueMetadata(id, updateData);

		if (success) {
			const updatedVenue = getVenueDetails(id);
			return new Response(
				JSON.stringify({ success: true, venue: updatedVenue }),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		} else {
			return new Response(
				JSON.stringify({ error: "Failed to update venue. It may not exist." }),
				{ status: 404 },
			);
		}
	} catch (error) {
		console.error("Error updating venue:", error);
		return new Response(
			JSON.stringify({ error: "Invalid payload or server error" }),
			{ status: 500 },
		);
	}
};
