import type { APIRoute } from "astro";
import { getHealthStats } from "../../../../src/db/admin-queries";

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
