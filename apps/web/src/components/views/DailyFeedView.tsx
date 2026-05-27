import { useStore } from "@nanostores/react";
import type { Show } from "@open-setlist/types";
import { ShowCard } from "@open-setlist/ui/src/components/ui/ShowCard";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { GroupedVirtuoso } from "react-virtuoso";
import {
	eventsStore,
	isLoadingFutureStore,
	isLoadingPastStore,
	selectedShowStore,
	topVisibleVenueStore,
} from "../../stores/appState";
import { fetchNewerMonth, fetchOlderMonth } from "../../stores/dataActions";
import { filteredShowsStore } from "../../stores/filteredShows";
import { groupByDate } from "../../utils/show-transformers";

export function DailyFeedView({
	initialShows = [],
}: {
	initialShows?: Show[];
}) {
	const filteredShows = useStore(filteredShowsStore);
	const rawShows = useStore(eventsStore);
	const loadingPast = useStore(isLoadingPastStore);
	const loadingFuture = useStore(isLoadingFutureStore);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const shows = rawShows.length > 0 ? filteredShows : initialShows;
	const onShowClick = (show: Show) => selectedShowStore.set(show);

	const [firstItemIndex, setFirstItemIndex] = useState(10000);
	const prevFirstShowIdRef = useRef<string | undefined>(undefined);

	if (shows.length > 0) {
		if (
			prevFirstShowIdRef.current !== undefined &&
			shows[0].id !== prevFirstShowIdRef.current
		) {
			const oldIndex = shows.findIndex(
				(s) => s.id === prevFirstShowIdRef.current,
			);
			if (oldIndex > 0) {
				setFirstItemIndex((prev) => prev - oldIndex);
			}
		}
		prevFirstShowIdRef.current = shows[0].id;
	}

	const { groups, groupCounts, groupedShows } = useMemo(() => {
		return groupByDate(shows);
	}, [shows]);

	const formatHeaderDate = (dateString: string) => {
		const d = new Date(dateString);
		if (Number.isNaN(d.getTime())) {
			return `Date: ${dateString.replace("-undefined-", "-??-")}`;
		}
		return d.toLocaleDateString("en-US", {
			weekday: "long",
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		});
	};

	const isToday = (dateString: string) => {
		if (!mounted) return false;
		const today = new Date().toISOString().split("T")[0];
		return dateString === today;
	};

	if (shows.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center text-slate-500">
				<h2 className="text-xl font-bold text-slate-900 mb-1">
					No events found currently
				</h2>
				<p className="text-slate-500">
					Try adjusting your filters or search terms.
				</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="mt-6 text-primary font-bold hover:underline"
				>
					Reset Filters
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
			>
				<GroupedVirtuoso
					firstItemIndex={firstItemIndex}
					useWindowScroll
					rangeChanged={(range) => {
						// map virtuoso virtual indices back to our array
						const topShow =
							groupedShows[Math.max(0, range.startIndex - firstItemIndex)];
						if (topShow && topShow.venue_id !== topVisibleVenueStore.get()) {
							topVisibleVenueStore.set(topShow.venue_id);
						}
					}}
					groupCounts={groupCounts}
					groupContent={(index) => {
						// groupIndex is 0-based regardless of firstItemIndex
						const date = groups[index];
						if (!date) return null;
						return (
							<div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-4">
								<div className="lg:w-48 flex-shrink-0 bg-white rounded-lg px-4 py-2 border border-[rgba(0,0,0,0.1)]">
									<h2
										className={`text-sm font-black uppercase tracking-widest ${isToday(date) ? "text-[#0052a3]" : "text-[#59647a]"}`}
									>
										{isToday(date) && "• "}
										{formatHeaderDate(date)}
									</h2>
									{isToday(date) && (
										<span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full mt-2 inline-block">
											TODAY
										</span>
									)}
								</div>
							</div>
						);
					}}
					itemContent={(index) => {
						const arrayIndex = index - firstItemIndex;
						const show = groupedShows[arrayIndex];
						if (!show) {
							console.warn(
								`No show found for virtuoso absolute index ${index} (arrayIndex: ${arrayIndex})`,
							);
							return null;
						}
						return (
							<div className="flex flex-col lg:flex-row gap-6 lg:gap-12 py-2">
								<div className="lg:w-48 hidden lg:block flex-shrink-0"></div>
								<div className="flex-1">
									<ShowCard show={show} onClick={() => onShowClick(show)} />
								</div>
							</div>
						);
					}}
					components={{
						Header: () => (
							<div className="flex justify-center pb-2 text-center relative z-20">
								{loadingPast ? (
									<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
								) : (
									<button
										type="button"
										onClick={async () => {
											await fetchOlderMonth();
										}}
										className="text-[11px] font-bold text-[#59647a] hover:text-[#0052a3] transition-colors py-1.5 px-4 rounded-full border border-[rgba(0,0,0,0.1)] bg-white shadow-sm hover:shadow-md cursor-pointer pointer-events-auto"
									>
										↑ Load past events
									</button>
								)}
							</div>
						),
						Footer: () => (
							<div className="flex justify-center py-6 text-center relative z-20">
								{loadingFuture ? (
									<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
								) : (
									<button
										type="button"
										onClick={() => fetchNewerMonth()}
										className="text-xs font-bold text-[#59647a] hover:text-[#0052a3] transition-colors py-2 px-6 rounded-full border border-[rgba(0,0,0,0.1)] bg-white shadow-sm hover:shadow-md cursor-pointer pointer-events-auto"
									>
										↓ Load newer events
									</button>
								)}
							</div>
						),
					}}
				/>
			</motion.div>
		</div>
	);
}
