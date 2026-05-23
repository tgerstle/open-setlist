import type { Show } from "@open-setlist/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import { ShowPill } from "./ShowPill";

interface DayEventsModalProps {
	isOpen: boolean;
	onClose: () => void;
	dateStr: string;
	monthName: string;
	day: number;
	year: number;
	shows: Show[];
	onShowClick: (show: Show) => void;
	onNextDay?: () => void;
	onPrevDay?: () => void;
}

export function DayEventsModal({
	isOpen,
	onClose,

	monthName,
	day,
	year,
	shows,
	onShowClick,
	onNextDay,
	onPrevDay,
}: DayEventsModalProps) {
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowLeft" && onPrevDay) onPrevDay();
			if (e.key === "ArrowRight" && onNextDay) onNextDay();
		};

		window.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose, onNextDay, onPrevDay]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Modal Content */}
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
					<div className="flex items-center gap-1">
						<button
							onClick={onPrevDay}
							className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-[#0075de]"
							aria-label="Previous Day"
						>
							<ChevronLeft size={20} />
						</button>
						<div className="px-2">
							<h3
								id="modal-title"
								className="font-black text-slate-900 uppercase tracking-tight text-sm md:text-base"
							>
								{monthName} {day}, {year}
							</h3>
							<p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
								{shows.length} {shows.length === 1 ? "Event" : "Events"}
							</p>
						</div>
						<button
							onClick={onNextDay}
							className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-[#0075de]"
							aria-label="Next Day"
						>
							<ChevronRight size={20} />
						</button>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
						aria-label="Close modal"
					>
						<X size={20} />
					</button>
				</div>

				<div className="p-4 max-h-[60vh] overflow-y-auto space-y-2 pb-6 outline-none">
					{shows.length === 0 ? (
						<div className="py-12 text-center">
							<p className="text-slate-400 text-sm font-medium italic">
								No events found currently.
							</p>
						</div>
					) : (
						shows.map((show) => (
							<div
								key={show.id}
								className="transform transition-transform active:scale-[0.98]"
							>
								<ShowPill
									show={show}
									onClick={() => {
										onShowClick(show);
									}}
								/>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
