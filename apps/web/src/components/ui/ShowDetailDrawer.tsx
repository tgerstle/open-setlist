import { useStore } from "@nanostores/react";
import type { Show } from "@open-setlist/types";
import {
	Calendar as CalendarIcon,
	Clock,
	ExternalLink,
	Info,
	MapPin,
	Music,
	Navigation,
	PlayCircle,
	Ticket,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { venuesStore } from "../../stores/appState";
import { VenuePill } from "./VenuePill";

interface ShowDetailDrawerProps {
	show: Show | null;
	onClose: () => void;
}

export function ShowDetailDrawer({ show, onClose }: ShowDetailDrawerProps) {
	const [isVisible, setIsVisible] = useState(false);
	const venues = useStore(venuesStore);

	// Handle animation mounting
	useEffect(() => {
		if (show) {
			setIsVisible(true);
			document.body.style.overflow = "hidden"; // Prevent background scrolling
		} else {
			setIsVisible(false);
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [show]);

	if (!show && !isVisible) return null;

	const artistName = show?.artist || show?.artist_name || "Unknown Artist";
	const showDate = show?.date || show?.event_date;

	let formattedDate = "";
	if (showDate) {
		const d = new Date(showDate);
		if (!Number.isNaN(d.getTime())) {
			formattedDate = d.toLocaleDateString("en-US", {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
				timeZone: "UTC",
			});
		} else {
			formattedDate = showDate;
		}
	}

	const isTicketProvider = (url: string) => {
		if (!url) return false;
		const lowerUrl = url.toLowerCase();

		// Default fallback list purely for safety if env not set
		const fallbackProviders =
			"axs.com,ticketmaster.com,venuepilot.com,eventbrite.com,etix.com,ticketweb.com,dice.fm,pabsttheatergroup.com,livenation.com";
		const rawProviders =
			import.meta.env?.PUBLIC_TICKET_PROVIDERS || fallbackProviders;
		const providersList = rawProviders.split(",").map((p) => p.trim());

		return providersList.some((provider) => lowerUrl.includes(provider));
	};

	const getTicketCtaText = () => {
		if (!show) return "";
		if (show.is_sold_out) return "Tickets Unavailable";
		if (!show.ticket_url) return "Find Show";
		return isTicketProvider(show.ticket_url)
			? "Get Tickets"
			: "View on Venue Website";
	};

	const encodedArtist = encodeURIComponent(artistName);
	const encodedVenue = encodeURIComponent(
		`${show?.venue_name || ""} Demo City WI`,
	);
	const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedVenue}`;
	const spotifyUrl = `https://open.spotify.com/search/${encodedArtist}/artists`;
	const youtubeUrl = `https://www.youtube.com/results?search_query=${encodedArtist}+live`;

	const _venue = venues.find((v) => v.id === show?.venue_id);

	// Create a highly robust fallback url pointing to Google Search for the venue and show if no ticket link was scraped
	const encodedSearch = encodeURIComponent(
		`${artistName === "Unknown Artist" ? "" : artistName} ${show?.venue_name || ""} tickets Demo City WI`.trim(),
	);
	const fallbackVenueUrl = `https://www.google.com/search?q=${encodedSearch}`;
	const finalCtaUrl = show?.ticket_url || fallbackVenueUrl;

	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 z-[100] bg-[rgba(0,0,0,0.2)] backdrop-blur-[2px] transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0 pointer-events-none"}`}
				onClick={onClose}
			/>

			{/* Drawer Panel */}
			<div
				className={`fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-white shadow-[var(--shadow-lg)] border-l border-[rgba(0,0,0,0.1)] transform transition-transform duration-300 ease-in-out flex flex-col ${show ? "translate-x-0" : "translate-x-full"}`}
			>
				{/* Header / Close Button */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.1)]">
					<span className="text-sm font-semibold text-[#a39e98] tracking-[0.125px] uppercase">
						Event Details
					</span>
					<button
						onClick={onClose}
						className="p-2 -mr-2 text-[#615d59] hover:bg-[#f6f5f4] hover:text-[rgba(0,0,0,0.95)] rounded-full transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Scrollable Content */}
				{show && (
					<div className="flex-1 overflow-y-auto p-6 space-y-8">
						{/* Title Section */}
						<div>
							{show.is_sold_out && (
								<span className="inline-block mb-3 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full tracking-[0.125px] uppercase">
									Sold Out
								</span>
							)}
							<h2 className="text-3xl sm:text-4xl font-bold text-[rgba(0,0,0,0.95)] tracking-[-1.5px] leading-[1.1] mb-4">
								{artistName}
							</h2>

							<div className="flex flex-wrap items-center gap-2">
								<VenuePill
									name={show.venue_name}
									shortName={show.venue_short_name}
									themeColor={show.venue_theme_color}
								/>
							</div>
						</div>

						{/* Meta Data Grid */}
						<div className="bg-[#f6f5f4] rounded-xl p-5 space-y-4 border border-[rgba(0,0,0,0.05)]">
							<div className="flex items-start gap-3">
								<CalendarIcon className="w-5 h-5 text-[#a39e98] mt-0.5" />
								<div>
									<p className="text-sm font-medium text-[#615d59]">Date</p>
									<p className="text-[rgba(0,0,0,0.95)] font-medium">
										{formattedDate}
									</p>
								</div>
							</div>

							{show.event_time && (
								<div className="flex items-start gap-3">
									<Clock className="w-5 h-5 text-[#a39e98] mt-0.5" />
									<div>
										<p className="text-sm font-medium text-[#615d59]">Time</p>
										<p className="text-[rgba(0,0,0,0.95)] font-medium">
											{show.event_time}
										</p>
									</div>
								</div>
							)}

							<div className="flex items-start gap-3">
								<MapPin className="w-5 h-5 text-[#a39e98] mt-0.5" />
								<div>
									<p className="text-sm font-medium text-[#615d59]">Venue</p>
									<p className="text-[rgba(0,0,0,0.95)] font-medium">
										{show.venue_name}
									</p>
								</div>
							</div>
						</div>

						{/* Additional Info */}
						<div className="space-y-3">
							{show.age_restriction && (
								<div className="flex items-center gap-2 text-sm text-[#615d59]">
									<Info className="w-4 h-4" />
									<span>
										Age Restriction:{" "}
										<strong className="text-[rgba(0,0,0,0.95)]">
											{show.age_restriction}
										</strong>
									</span>
								</div>
							)}
							{show.last_scanned_at && (
								<div className="flex items-center gap-2 text-xs text-[#a39e98]">
									<span>
										Last verified:{" "}
										{new Date(show.last_scanned_at).toLocaleString()}
									</span>
								</div>
							)}
						</div>

						{/* Listen & Discover */}
						<div className="pt-4 border-t border-[rgba(0,0,0,0.1)]">
							<h3 className="text-sm font-semibold text-[#615d59] mb-3 uppercase tracking-wider">
								Listen & Discover
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<a
									href={spotifyUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 px-3 py-2 bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954]/20 rounded-lg transition-colors text-sm font-medium"
								>
									<Music className="w-4 h-4" /> Listen on Spotify
								</a>
								<a
									href={youtubeUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 px-3 py-2 bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000]/20 rounded-lg transition-colors text-sm font-medium"
								>
									<PlayCircle className="w-4 h-4" /> Watch on YouTube
								</a>
							</div>
						</div>

						{/* Directions */}
						<div className="pt-2 border-none">
							<a
								href={mapUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium w-full"
							>
								<Navigation className="w-4 h-4" /> Get Directions to Venue
							</a>
						</div>
					</div>
				)}

				{/* Footer / CTA */}
				{show && (
					<div className="p-6 border-t border-[rgba(0,0,0,0.1)] bg-[#f6f5f4]">
						<a
							href={finalCtaUrl}
							target="_blank"
							rel="noopener noreferrer"
							className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-semibold transition-all ${
								show.is_sold_out
									? "bg-[rgba(0,0,0,0.05)] text-[#615d59] cursor-not-allowed opacity-70"
									: "bg-[#0075de] text-white hover:bg-[#005bab] shadow-[var(--shadow-sm)] hover:shadow-md"
							}`}
							onClick={(e) => show.is_sold_out && e.preventDefault()}
						>
							<Ticket className="w-5 h-5" />
							{getTicketCtaText()}
							{!show.is_sold_out && (
								<ExternalLink className="w-4 h-4 ml-1 opacity-70" />
							)}
						</a>
					</div>
				)}
			</div>
		</>
	);
}
