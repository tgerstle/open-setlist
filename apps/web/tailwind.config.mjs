// tailwind.config.mjs
import containerQueries from "@tailwindcss/container-queries";
import sharedConfig from "@open-setlist/config-tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedConfig],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    {
      pattern: /bg-(blue|sky|fuchsia|orange|red|amber|indigo|slate|purple|emerald|teal|pink|lime|cyan|yellow|zinc|stone|violet|rose|green)-(50|100|500)/,
    },
    {
      pattern: /text-(blue|sky|fuchsia|orange|red|amber|indigo|slate|purple|emerald|teal|pink|lime|cyan|yellow|zinc|stone|violet|rose|green)-(800|900)/,
    },
    {
      pattern: /border-(blue|sky|fuchsia|orange|red|amber|indigo|slate|purple|emerald|teal|pink|lime|cyan|yellow|zinc|stone|violet|rose|green)-(100|200)/,
    },
    {
      pattern: /ring-(blue|sky|fuchsia|orange|red|amber|indigo|slate|purple|emerald|teal|pink|lime|cyan|yellow|zinc|stone|violet|rose|green)-(300)/,
      variants: ["group-hover"],
    },
  ],
  plugins: [containerQueries],
};