import { useStore } from "@nanostores/react";
import type { Show } from "@open-setlist/types";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
	availableMonthsStore,
	eventsStore,
	isLoadingFutureStore,
	isLoadingPastStore,
	loadedMonthsStore,
	selectedShowStore,
} from "../../stores/appState";
import { filteredShowsStore } from "../../stores/filteredShows";
import { DayEventsModal } from "@open-setlist/ui/src/components/ui/DayEventsModal";
import { ShowPill } from "@open-setlist/ui/src/components/ui/ShowPill";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthGridView({
	initialShows = [],
}: {
	initialShows?: Show[];
}) {
	const filteredShows = useStore(filteredShowsStore);
	const rawShows = useStore(eventsStore);
	const loadedMonths = useStore(loadedMonthsStore);
	const availableMonths = useStore(availableMonthsStore);
	const isLoadingPast = useStore(isLoadingPastStore);
	const isLoadingFuture = useStore(isLoadingFutureStore);

	const shows = rawShows.length > 0 ? filteredShows : initialShows;

	const onShowClick = (show: Show) => {
		selectedShowStore.set(show);
	};

	const [selectedDayEvents, setSelectedDayEvents] = useState<{
		dateStr: string;
		monthName: string;
		day: number;
		year: number;
		shows: Show[];
	} | null>(null);

	// Deduplicate by ID just in case
	const safeShows = useMemo(() => {
		const ids = new Set();
		return shows.filter((s) => {
			const showId = s.id || `${s.event_date}-${s.venue_id}-${s.artist_name}`;
			if (ids.has(showId)) return false;
			ids.add(showId);
			return true;
		});
	}, [shows]);

	const sortedMonths = useMemo(() => {
		return [...loadedMonths].sort();
	}, [loadedMonths]);

	// Pre-calculate data for each month grid
	const calendarMonths = useMemo(() => {
		if (sortedMonths.length === 0) return [];

		return sortedMonths.map((monthStr) => {
			// monthStr is like "YYYY-MM"
			const [yearStr, monthNumStr] = monthStr.split("-");
			const year = parseInt(yearStr, 10);
			const monthIndex = parseInt(monthNumStr, 10) - 1;

			const firstOfMo = new Date(year, monthIndex, 1);
			const lastOfMo = new Date(year, monthIndex + 1, 0);

			const daysInMonth = lastOfMo.getDate();
			const startDayOfWeek = firstOfMo.getDay();
			const endDayOfWeek = lastOfMo.getDay();

			const monthName = firstOfMo.toLocaleDateString("en-US", {
				month: "long",
			});

			const days = [];
			// Pad beginning
			for (let i = 0; i < startDayOfWeek; i++) {
				days.push(null);
			}

			// Actual days
			for (let day = 1; day <= daysInMonth; day++) {
				const _m = String(monthIndex + 1).padStart(2, "0");
				const _d = String(day).padStart(2, "0");
				const dStr = `${year}-${_m}-${_d}`;

				const dayShows = safeShows.filter((s) => {
					const sDate = s.date || s.event_date;
					return sDate === dStr;
				});

				days.push({
					day,
					dateStr: dStr,
					shows: dayShows,
					monthName,
					year,
				});
			}

			// Pad end to complete the grid row
			const paddingEnd = 6 - endDayOfWeek;
			for (let i = 0; i < paddingEnd; i++) {
				days.push(null);
			}

			return {
				monthStr,
				monthName,
				year,
				days,
			};
		});
	}, [sortedMonths, safeShows]);

	// We need to support navigating the modal across all active days
	const allDaysList = useMemo(() => {
		return calendarMonths.flatMap((m) => m.days.filter((d) => d !== null));
	}, [calendarMonths]);

	const canLoadOlder =
		loadedMonths.length > 0 && availableMonths.indexOf(loadedMonths[0]) > 0;
	const canLoadNewer =
		loadedMonths.length > 0 &&
		availableMonths.indexOf(loadedMonths[loadedMonths.length - 1]) <
			availableMonths.length - 1;

	const onLoadPast = () => {
		if (typeof window !== "undefined" && window._loadOlderShows) {
			window._loadOlderShows();
		}
	};

	const onLoadFuture = () => {
		if (typeof window !== "undefined" && window._loadNewerShows) {
			window._loadNewerShows();
		}
	};

	return (
		<div className="flex flex-col h-full gap-10 relative pb-10">
			{/* Load Previous Button */}
			{canLoadOlder && (
				<div className="flex justify-center sticky top-0 z-30 pt-2 pb-4">
					<button
						onClick={onLoadPast}
						disabled={isLoadingPast}
						className={`px-6 py-2 bg-white/90 backdrop-blur-sm border shadow-sm text-[#59647a] font-bold text-[10px] uppercase tracking-widest rounded-full transition-all active:scale-95 ${
							isLoadingPast
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-slate-50 border-slate-200"
						}`}
					>
						{isLoadingPast ? "Loading history..." : "↑ Load Previous Month"}
					</button>
				</div>
			)}

			{calendarMonths.map((calMonth, mIndex) => (
				<motion.div
					key={calMonth.monthStr}
					className="bg-white rounded-xl border border-[rgba(0,0,0,0.1)] shadow-sm overflow-hidden flex flex-col"
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: mIndex * 0.05, ease: "easeOut" }}
				>
					{/* Month Header Banner */}
					<div className="bg-slate-50 border-b border-slate-100 py-3 px-4 flex justify-between items-end">
						<h2 className="text-xl font-bold tracking-tight text-[#1e293b]">
							{calMonth.monthName}{" "}
							<span className="text-slate-400 font-medium ml-1">
								{calMonth.year}
							</span>
						</h2>
					</div>

					{/* Days of Week Header */}
					<div className="grid grid-cols-7 border-b border-[rgba(0,0,0,0.05)] bg-white text-xs font-semibold text-[#59647a]/70 tracking-[0.125px]">
						{weekDays.map((day) => (
							<div
								key={day}
								className="py-2 text-center uppercase border-r border-[rgba(0,0,0,0.02)] last:border-r-0"
							>
								{day}
							</div>
						))}
					</div>

					{/* Grid Cells */}
					<div className="grid grid-cols-7 auto-rows-fr bg-[#f6f5f4] gap-[1px]">
						{calMonth.days.map((cell, i) => {
							if (!cell) {
								// Empty padding cell
								return (
									<div
										key={`pad-${i}`}
										className="bg-[#fafafa] min-h-[120px] lg:min-h-[140px]"
									/>
								);
							}

							const isToday =
								cell.dateStr === new Date().toISOString().split("T")[0];

							return (
								<div
									key={cell.dateStr}
									onClick={() =>
										setSelectedDayEvents({
											dateStr: cell.dateStr,
											monthName: cell.monthName,
											day: cell.day,
											year: cell.year,
											shows: cell.shows,
										})
									}
									className={`bg-white min-h-[120px] lg:min-h-[140px] p-1.5 md:p-2 transition-colors relative group hover:bg-[rgba(0,0,0,0.01)] cursor-pointer`}
								>
									{/* Day Number */}
									<div className="mb-2">
										<span
											className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold tracking-[-0.125px] ${
												isToday
													? "bg-[#0052a3] text-white shadow-md"
													: "text-[#31302e]"
											}`}
										>
											{cell.day}
										</span>
									</div>

									{/* Stacked Show Pills */}
									<div className="space-y-0.5 max-h-[160px] overflow-y-auto no-scrollbar pr-0.5">
										{cell.shows.slice(0, 4).map((show) => (
											<ShowPill
												key={show.id}
												show={show}
												onClick={() => onShowClick(show)}
											/>
										))}

										{cell.shows.length > 4 && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													setSelectedDayEvents({
														dateStr: cell.dateStr,
														monthName: cell.monthName,
														day: cell.day,
														year: cell.year,
														shows: cell.shows,
													});
												}}
												className="w-full text-center py-1 text-[9px] font-black text-[#59647a] hover:text-[#0052a3] transition-colors hover:bg-slate-50 rounded border border-dashed border-slate-200 mt-1"
											>
												+ {cell.shows.length - 4} MORE
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</motion.div>
			))}

			{/* Load More Button */}
			{canLoadNewer && (
				<div className="flex justify-center mt-4">
					<button
						onClick={onLoadFuture}
						disabled={isLoadingFuture}
						className={`px-8 py-3 bg-white border-2 text-[#59647a] font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-sm active:scale-95 ${
							isLoadingFuture
								? "opacity-50 cursor-not-allowed border-slate-200"
								: "border-slate-200 hover:bg-[#0052a3] hover:text-white hover:border-[#0052a3]"
						}`}
					>
						{isLoadingFuture ? "Fetching data..." : "Load Next Month"}
					</button>
				</div>
			)}

			{/* Reusing Modal logic but iterating over allDaysList mapping for prev/next month boundaries */}
			<DayEventsModal
				isOpen={!!selectedDayEvents}
				onClose={() => setSelectedDayEvents(null)}
				dateStr={selectedDayEvents?.dateStr || ""}
				monthName={selectedDayEvents?.monthName || ""}
				day={selectedDayEvents?.day || 0}
				year={selectedDayEvents?.year || 0}
				shows={selectedDayEvents?.shows || []}
				onShowClick={onShowClick}
				onNextDay={() => {
					if (!selectedDayEvents) return;
					const currentIndex = allDaysList.findIndex(
						(d) => d?.dateStr === selectedDayEvents.dateStr,
					);
					if (currentIndex !== -1 && currentIndex < allDaysList.length - 1) {
						const next = allDaysList[currentIndex + 1];
						if (next) setSelectedDayEvents(next);
					}
				}}
				onPrevDay={() => {
					if (!selectedDayEvents) return;
					const currentIndex = allDaysList.findIndex(
						(d) => d?.dateStr === selectedDayEvents.dateStr,
					);
					if (currentIndex > 0) {
						const prev = allDaysList[currentIndex - 1];
						if (prev) setSelectedDayEvents(prev);
					}
				}}
			/>
		</div>
	);
}
