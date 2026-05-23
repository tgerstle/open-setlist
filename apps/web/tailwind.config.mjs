// tailwind.config.mjs
import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	safelist: [
		{
			pattern:
				/bg-(blue|sky|fuchsia|orange|red|amber|indigo|slate|purple|emerald|teal|pink|lime|cyan|yellow|zinc|stone|violet|rose|green)-(50|100|500)/,
		},
		{
			pattern:
				/text-(blue|sky|fuchsia|orange|red|amber|indigo|slate|purple|emerald|teal|pink|lime|cyan|yellow|zinc|stone|violet|rose|green)-(800|900)/,
		},
		{
			pattern:
				/border-(blue|sky|fuchsia|orange|red|amber|indigo|slate|purple|emerald|teal|pink|lime|cyan|yellow|zinc|stone|violet|rose|green)-(100|200)/,
		},
		{
			pattern:
				/ring-(blue|sky|fuchsia|orange|red|amber|indigo|slate|purple|emerald|teal|pink|lime|cyan|yellow|zinc|stone|violet|rose|green)-(300)/,
			variants: ["group-hover"],
		},
	],
	theme: {
		extend: {
			colors: {
				mke: {
					"blue-dark": "#0059b3", // Demo City Flag Blue (Dark)
					"blue-light": "#80b3ff", // Demo City Flag Blue (Light)
					gold: "#ffcc00", // Demo City Flag Gold (Sun)
					white: "#ffffff", // White
				},
				// Direct aliasing for Shadcn and semantic use
				primary: {
					DEFAULT: "#0059b3",
					foreground: "#ffffff",
				},
				secondary: {
					DEFAULT: "#ffcc00",
					foreground: "#0059b3",
				},
				accent: {
					DEFAULT: "#80b3ff",
					foreground: "#ffffff",
				},
				background: "#f8fafc", // Updated to slate-50 equivalent for softer feel
				foreground: "#1a1a1a",
			},
			backgroundImage: {
				"sunrise-gradient": "linear-gradient(to bottom, #80b3ff, #0059b3)",
			},
		},
	},
	plugins: [containerQueries],
};
