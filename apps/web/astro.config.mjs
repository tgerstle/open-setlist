// @ts-check

import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "static",
	adapter: node({
		mode: "standalone",
	}),
	srcDir: "./src",
	integrations: [
		react(),
		{
			name: "dev-admin-routes",
			hooks: {
				"astro:config:setup": ({ command, injectRoute, logger }) => {
					if (command === "dev") {
						logger.info("Injecting admin routes for development...");

						// Admin UI Routes
						injectRoute({
							pattern: "/admin/dashboard",
							entrypoint: "./src/admin-pages/admin/dashboard.astro",
						});
						injectRoute({
							pattern: "/admin/events",
							entrypoint: "./src/admin-pages/admin/events.astro",
						});
						injectRoute({
							pattern: "/admin/events/[id]",
							entrypoint: "./src/admin-pages/admin/events/[id].astro",
						});
						injectRoute({
							pattern: "/admin/venues/[id]",
							entrypoint: "./src/admin-pages/admin/venues/[id].astro",
						});

						// Admin API Routes
						injectRoute({
							pattern: "/api/admin/logs",
							entrypoint: "./src/admin-pages/api-admin/logs.ts",
						});
						injectRoute({
							pattern: "/api/admin/health",
							entrypoint: "./src/admin-pages/api-admin/health.ts",
						});
						injectRoute({
							pattern: "/api/admin/events",
							entrypoint: "./src/admin-pages/api-admin/events.ts",
						});
						injectRoute({
							pattern: "/api/admin/events/[id]",
							entrypoint: "./src/admin-pages/api-admin/events/[id].ts",
						});
						injectRoute({
							pattern: "/api/admin/venues",
							entrypoint: "./src/admin-pages/api-admin/venues.ts",
						});
						injectRoute({
							pattern: "/api/admin/venues/[id]",
							entrypoint: "./src/admin-pages/api-admin/venues/[id].ts",
						});
					}
				},
			},
		},
	],

	vite: {
		plugins: [ /* @ts-ignore */ tailwindcss() ],
	},
});
