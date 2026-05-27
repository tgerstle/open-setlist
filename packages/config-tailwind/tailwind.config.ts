import containerQueries from "@tailwindcss/container-queries";
import type { Config } from "tailwindcss";

export default {
	content: [],
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
				background: "#f8fafc",
				foreground: "#1a1a1a",
			},
			backgroundImage: {
				"sunrise-gradient": "linear-gradient(to bottom, #80b3ff, #0059b3)",
			},
		},
	},
	plugins: [containerQueries],
} satisfies Config;