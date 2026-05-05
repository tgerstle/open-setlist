import type { Show, Venue } from "../../types/models";
import React from "react";

interface ShowPillProps {
  show: Show;
  onClick: () => void;
}

export function ShowPill({ show, onClick }: ShowPillProps) {
  const artistName = show.artist || show.artist_name || "Unknown Artist";
  const isSoldOut = show.is_sold_out;
  const showDate = show.date || show.event_date;
  const themeColor = show.venue_theme_color || 'slate';

  // Format date for pill display (e.g., "4/6")
  const formattedDate = React.useMemo(() => {
    if (!showDate) return "";
    const d = new Date(showDate);
    if (isNaN(d.getTime())) return "";
    // Note: Use UTC to match the ISO string format from the DB
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  }, [showDate]);

  // Use short name or initials
  let venueInitials = show.venue_short_name || show.venue_name || "";
  if (!show.venue_short_name && venueInitials.length > 3) {
      if (venueInitials.toLowerCase().includes("rave")) venueInitials = "RV";
      else if (venueInitials.toLowerCase().includes("pabst")) venueInitials = "PT";
      else if (venueInitials.toLowerCase().includes("turner")) venueInitials = "TH";
      else if (venueInitials.toLowerCase().includes("riverside"))
        venueInitials = "RT";
      else if (venueInitials.toLowerCase().includes("cactus")) venueInitials = "CC";
      else if (venueInitials.toLowerCase().includes("shank")) venueInitials = "SH";
      else if (venueInitials.toLowerCase().includes("cooperage"))
        venueInitials = "CO";
      else if (venueInitials.toLowerCase().includes("x-ray")) venueInitials = "XR";
      else if (venueInitials.toLowerCase().includes("vivarium"))
        venueInitials = "VV";
      else venueInitials = venueInitials.substring(0, 3).toUpperCase();
  }

  // Tailwind Safelist
  // bg-slate-100 text-slate-800 border-slate-200
  // bg-blue-100 text-blue-800 border-blue-200
  // bg-emerald-100 text-emerald-800 border-emerald-200
  // bg-rose-100 text-rose-800 border-rose-200
  // bg-cyan-100 text-cyan-800 border-cyan-200
  // bg-amber-100 text-amber-800 border-amber-200
  // bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200
  // bg-teal-100 text-teal-800 border-teal-200
  // bg-zinc-100 text-zinc-800 border-zinc-200
  // bg-purple-100 text-purple-800 border-purple-200
  // bg-indigo-100 text-indigo-800 border-indigo-200
  // bg-stone-100 text-stone-800 border-stone-200
  // bg-red-100 text-red-800 border-red-200
  // bg-sky-100 text-sky-800 border-sky-200

  const colorClass = `bg-${themeColor}-100 text-${themeColor}-800 border-${themeColor}-200`;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left flex items-center gap-1.5 px-1.5 py-0.5 text-[10px] leading-tight rounded border transition cursor-pointer truncate mb-0.5 ${
        isSoldOut
          ? "bg-slate-50 text-[#64748b] border-slate-100 line-through"
          : `${colorClass} hover:opacity-80 hover:shadow-sm`
      }`}
      title={`${artistName} @ ${show.venue_name} on ${showDate}`}
    >
      <span className="shrink-0 font-bold">{venueInitials}</span>
      {formattedDate && (
        <span className="shrink-0 text-[#475569] opacity-80 font-bold border-r border-slate-300 pr-1.5 py-0.5 my-[-2px]">
          {formattedDate}
        </span>
      )}
      <span className="truncate font-medium">{artistName}</span>
    </button>
  );
}
