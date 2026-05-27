import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { Button } from "./button";
import type { Venue } from "@open-setlist/types";




export interface FilterBarProps {
	initialVenues: Venue[];
	searchQuery: string;
	selectedVenue: string | null;
	dateRange: { from: string | null; to: string | null } | undefined;
	topVenue: string | null;
	selectedShow: any | null;
	onClearFilters: () => void;
	children?: (isOpen: boolean, close: () => void) => React.ReactNode;
}

export function FilterBar({
	initialVenues,
	searchQuery,
	selectedVenue,
	dateRange,
	topVenue,
	selectedShow,
	onClearFilters,
	children,
}: FilterBarProps) {
	const [isOpen, setIsOpen] = useState(false);

	const activeFiltersCount = [
		searchQuery ? 1 : 0,
		selectedVenue ? 1 : 0,
		dateRange?.from ? 1 : 0,
	].reduce((a, b) => a + b, 0);

	// Priority hierarchy for what venue drives the header color
	const activeColorVenueId =
		selectedShow?.venue_id || selectedVenue || topVenue;

	const activeVenueCtx = initialVenues.find((v) => v.id === activeColorVenueId);
	const activeThemeColor = activeVenueCtx?.theme_color || "slate";

	// Tailwind v4 Dynamic Safelist for bg variants:
	// bg-blue-50 bg-sky-50 bg-fuchsia-50 bg-orange-50 bg-red-50 bg-amber-50 bg-indigo-50 bg-slate-50 bg-purple-50 bg-emerald-50 bg-teal-50 bg-pink-50 bg-lime-50 bg-cyan-50 bg-yellow-50 bg-zinc-50 bg-stone-50 bg-violet-50 bg-rose-50 bg-green-50
	// bg-blue-100 bg-sky-100 bg-fuchsia-100 bg-orange-100 bg-red-100 bg-amber-100 bg-indigo-100 bg-slate-100 bg-purple-100 bg-emerald-100 bg-teal-100 bg-pink-100 bg-lime-100 bg-cyan-100 bg-yellow-100 bg-zinc-100 bg-stone-100 bg-violet-100 bg-rose-100 bg-green-100
	const activeBgClass = activeVenueCtx
		? `bg-${activeThemeColor}-100`
		: "bg-white";

	// Dynamic body background tied to the active venue color
	useEffect(() => {
		// Extract the -50 variant from the pill string (e.g. "bg-blue-50 text-...")
		const bodyBgClass =
			activeVenueCtx && activeThemeColor
				? `bg-${activeThemeColor}-50`
				: "bg-[#f6f5f4]";

		// Remove existing bg- classes
		const classesToRemove = Array.from(document.body.classList).filter((c) =>
			c.startsWith("bg-"),
		);
		if (classesToRemove.length > 0) {
			document.body.classList.remove(...classesToRemove);
		}

		// Add the new bg class
		document.body.classList.add(bodyBgClass);

		// Ensure we style the transition nicely
		document.body.style.transition = "background-color 0.3s ease";
	}, [activeThemeColor, activeVenueCtx]);

	// Handle body scroll locking and Escape key
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
			const handleEscape = (e: KeyboardEvent) => {
				if (e.key === "Escape") setIsOpen(false);
			};
			window.addEventListener("keydown", handleEscape);
			return () => {
				document.body.style.overflow = "";
				window.removeEventListener("keydown", handleEscape);
			};
		}
	}, [isOpen]);

	return (
		<div
			className={`w-full border-b border-[rgba(0,0,0,0.1)] py-3 px-4 md:px-6 transition-colors duration-200 will-change-[background-color] ${activeBgClass}`}
		>
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => setIsOpen(true)}
						className="flex items-center gap-2"
					>
						<Filter className="w-4 h-4" />
						<span>
							Search & Filter{" "}
							{activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
						</span>
					</Button>

					{activeFiltersCount > 0 && (
						<button
							onClick={onClearFilters}
							className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
						>
							<X className="w-4 h-4" />
							<span className="hidden sm:inline">Clear</span>
						</button>
					)}
				</div>
			</div>

			{typeof window !== "undefined" &&
				createPortal(
					<AnimatePresence>
						{isOpen && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
								onClick={() => setIsOpen(false)}
							>
								<motion.div
									initial={{ y: 20, opacity: 0, scale: 0.95 }}
									animate={{ y: 0, opacity: 1, scale: 1 }}
									exit={{ y: 20, opacity: 0, scale: 0.95 }}
									transition={{ duration: 0.2 }}
									onClick={(e) => e.stopPropagation()}
									className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
									role="dialog"
									aria-modal="true"
									aria-labelledby="modal-title"
								>
									<div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.1)] flex-shrink-0">
										<h3 id="modal-title" className="font-bold text-lg">
											Filters
										</h3>
										<button
											onClick={() => setIsOpen(false)}
											className="p-1 hover:bg-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-[#097fe8]"
											aria-label="Close modal"
										>
											<X className="w-5 h-5 text-slate-500" />
										</button>
									</div>

									<div className="overflow-y-auto flex-1">
										{children && children(isOpen, () => setIsOpen(false))}
									</div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</div>
	);
}
