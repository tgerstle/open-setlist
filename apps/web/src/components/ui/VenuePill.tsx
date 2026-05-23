import type { ThemeColor } from "@open-setlist/types";

interface Props {
	name: string;
	id?: string;
	shortName?: string;
	themeColor?: ThemeColor;
}

export function VenuePill({ name, shortName, themeColor = "slate" }: Props) {
	// Tailwind Safelist
	// bg-slate-50 text-slate-800 border-slate-100
	// bg-blue-50 text-blue-800 border-blue-100
	// bg-emerald-50 text-emerald-800 border-emerald-100
	// bg-rose-50 text-rose-800 border-rose-100
	// bg-cyan-50 text-cyan-800 border-cyan-100
	// bg-amber-50 text-amber-800 border-amber-100
	// bg-fuchsia-50 text-fuchsia-800 border-fuchsia-100
	// bg-teal-50 text-teal-800 border-teal-100
	// bg-zinc-50 text-zinc-800 border-zinc-100
	// bg-purple-50 text-purple-800 border-purple-100
	// bg-indigo-50 text-indigo-800 border-indigo-100
	// bg-stone-50 text-stone-800 border-stone-100
	// bg-red-50 text-red-800 border-red-100
	// bg-sky-50 text-sky-800 border-sky-100

	const display = shortName || name;
	return (
		<span
			className={`bg-${themeColor}-50 text-${themeColor}-800 border-${themeColor}-100 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border tracking-[0.125px] whitespace-nowrap`}
		>
			{display}
		</span>
	);
}
