import type { APIRoute } from "astro";
import { getVenuesOverview } from "../../../../src/db/admin-queries";

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
