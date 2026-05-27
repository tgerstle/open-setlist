import type { Show } from "@open-setlist/types";
import { Clock, DollarSign } from "lucide-react";
import { VenuePill } from "./VenuePill";

interface ShowCardProps {
	show: Show;
	onClick: () => void;
}

export function ShowCard({ show, onClick }: ShowCardProps) {
	// Format time if available, otherwise just use empty
	const timeDisplay = show.event_time ? show.event_time : null;
	const price = show.price || show.ticket_price;
	const isFree =
		price === 0 ||
		(typeof price === "string" && price.toLowerCase() === "free");
	const themeColor = show.venue_theme_color || "slate";

	return (
		<div
			onClick={onClick}
			className={`@container group bg-white rounded-[12px] border group-hover:ring-2 group-hover:ring-${themeColor}-300 ring-offset-2 border-${themeColor}-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200 ease-in-out cursor-pointer flex flex-col @[400px]:flex-row @[400px]:items-center justify-between gap-3`}
		>
			<div className="flex flex-col gap-0.5">
				<h3 className="font-bold text-slate-900 text-lg leading-tight tracking-tight group-hover:text-[#0052a3] transition-colors">
					{show.artist || show.artist_name}
				</h3>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#59647a] font-medium">
					{timeDisplay && (
						<div className="flex items-center gap-1">
							<Clock className="w-3.5 h-3.5" />
							<span>{timeDisplay}</span>
						</div>
					)}
					{price !== undefined && price !== null && (
						<div
							className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
								isFree
									? "bg-emerald-50 text-[#065f46]"
									: "bg-slate-100 text-[#334155]"
							}`}
						>
							{!isFree && <DollarSign className="w-3 h-3" />}
							<span>{isFree ? "FREE" : price}</span>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center gap-3 self-start @[400px]:self-auto">
				{show.is_sold_out ? (
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-[#b91c1c] uppercase tracking-wider">
						Sold Out
					</span>
				) : null}
				<VenuePill
					name={show.venue_name!} 
					id={show.venue_id}
					shortName={show.venue_short_name}
					themeColor={show.venue_theme_color}
				/>
			</div>
		</div>
	);
}
