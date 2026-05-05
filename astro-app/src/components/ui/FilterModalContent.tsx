import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Venue } from "../../types/models";
import {
  searchQueryStore,
  selectedVenueStore,
  dateRangeStore,
} from "../../stores/appState";
import {
  filteredShowsStore,
  debouncedSearchQueryStore,
} from "../../stores/filteredShows";
import { ensureDateRangeLoaded, loadSpecificMonths } from "../../stores/dataActions";
import { Button } from "./button";

type IndexRecord = { term: string; type: "artist" | "venue"; months: string[] };

export function FilterModalContent({
  initialVenues,
  close,
}: {
  initialVenues: Venue[];
  close: () => void;
}) {
  const searchQuery = useStore(searchQueryStore);
  const debouncedSearchQuery = useStore(debouncedSearchQueryStore);
  const selectedVenue = useStore(selectedVenueStore);
  const dateRange = useStore(dateRangeStore);
  const filteredShows = useStore(filteredShowsStore);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isLoadingMonths, setIsLoadingMonths] = useState(false);

  // Autocomplete state
  const fuseRef = useRef<any>(null);
  const [suggestions, setSuggestions] = useState<IndexRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isSearching = searchQuery !== debouncedSearchQuery || isLoadingMonths;

  // Initialize Fuse.js on focus
  const initializeSearch = async () => {
    if (fuseRef.current) return;
    try {
      const [FuseModule, indexData] = await Promise.all([
        import("fuse.js"),
        fetch("/data/search-index.json").then((res) => res.json())
      ]);
      const Fuse = FuseModule.default;
      fuseRef.current = new Fuse(indexData, {
        keys: ["term"],
        threshold: 0.3,
        includeScore: true,
      });
    } catch (err) {
      console.error("Failed to initialize search index", err);
    }
  };

  const onSearchChange = (val: string) => {
    searchQueryStore.set(val);
    if (!val) {
      setSuggestions([]);
      return;
    }
    if (fuseRef.current) {
      const results = fuseRef.current.search(val, { limit: 5 });
      setSuggestions(results.map((r: any) => r.item));
      setShowSuggestions(true);
    }
  };
  
  const onSuggestionSelect = async (record: IndexRecord) => {
    setShowSuggestions(false);
    
    if (record.months && record.months.length > 0) {
      setIsLoadingMonths(true);
      try {
        await loadSpecificMonths(record.months);
      } finally {
        setIsLoadingMonths(false);
      }
    }

    searchQueryStore.set(record.term);
  };

  const onVenueChange = (val: string | null) => selectedVenueStore.set(val);

  const applyDateRangeAsync = async (fromIso: string, toIso: string) => {
    setIsLoadingMonths(true);
    try {
      await ensureDateRangeLoaded(fromIso, toIso);
      dateRangeStore.set({ from: fromIso, to: toIso });
    } finally {
      setIsLoadingMonths(false);
    }
  };

  const setPreset = (preset: "weekend" | "month" | "next_month") => {
    const today = new Date();
    let from = new Date(today);
    let to = new Date(today);

    if (preset === "weekend") {
      const day = today.getDay();
      const diffToFriday = day === 0 ? -2 : day === 6 ? -1 : 5 - day;
      const friday = new Date(today);
      friday.setDate(today.getDate() + diffToFriday);
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      from = friday;
      to = sunday;
    } else if (preset === "month") {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (preset === "next_month") {
      from = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      to = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    }

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    applyDateRangeAsync(from.toISOString(), to.toISOString());
  };

  const onFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const fromIso = val ? new Date(val).toISOString() : null;
    const toIso = dateRange?.to || null;
    
    if (fromIso && toIso) {
      applyDateRangeAsync(fromIso, toIso);
    } else {
      dateRangeStore.set({ from: fromIso, to: toIso });
    }
  };

  const onToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const fromIso = dateRange?.from || null;
    const toIso = val ? new Date(val).toISOString() : null;
    
    if (fromIso && toIso) {
      applyDateRangeAsync(fromIso, toIso);
    } else {
      dateRangeStore.set({ from: fromIso, to: toIso });
    }
  };

  const clearDateRange = () => dateRangeStore.set(undefined);

  // Helper to format ISO to YYYY-MM-DD for input value
  const toInputDate = (iso: string | null | undefined) => {
    if (!iso) return "";
    return iso.split("T")[0];
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2 relative z-50">
        <label className="text-xs font-semibold text-[#615d59] uppercase tracking-wider">
          Artist / Venue Search
        </label>
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39e98] group-focus-within:text-[#097fe8]" />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onFocus={initializeSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[rgba(0,0,0,0.1)] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#097fe8]/50 focus:border-[#097fe8] text-[rgba(0,0,0,0.95)] placeholder-[#a39e98] transition-all"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-[rgba(0,0,0,0.1)] shadow-lg rounded-[4px] z-50 max-h-60 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button 
                    type="button"
                    onClick={() => onSuggestionSelect(s)}
                    className="w-full text-left px-4 py-2 text-sm text-[rgba(0,0,0,0.95)] hover:bg-[#f6f5f4] transition-colors flex items-center justify-between"
                  >
                    <span className="font-semibold truncate flex-1">{s.term}</span>
                    <div className="flex items-center justify-end gap-2 shrink-0 ml-2">
                      {s.months && s.months.length > 0 && (
                        <span className="text-[10px] text-[#817c76]">
                          {s.months.length === 1 
                            ? new Date(`${s.months[0]}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
                            : `${s.months.length} months`}
                        </span>
                      )}
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[#615d59] text-[10px] uppercase tracking-wider">{s.type}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#615d59] uppercase tracking-wider">
          Venue
        </label>
        <div className="relative w-full group">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39e98] group-focus-within:text-[#097fe8]" />
          <select
            value={selectedVenue || ""}
            onChange={(e) => onVenueChange(e.target.value || null)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[rgba(0,0,0,0.1)] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#097fe8]/50 focus:border-[#097fe8] text-[rgba(0,0,0,0.95)] appearance-none cursor-pointer"
          >
            <option value="">All Venues</option>
            {initialVenues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between mt-2">
          <label className="text-xs font-semibold text-[#615d59] uppercase tracking-wider">
            Date Filter
          </label>
          {dateRange && (
            <button
              onClick={clearDateRange}
              className="text-[10px] text-[#097fe8] hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPreset("weekend")}
            className="px-3 py-1.5 text-xs font-bold bg-[#f6f5f4] text-[rgba(0,0,0,0.8)] border border-[rgba(0,0,0,0.05)] rounded hover:bg-[#eaeaeb] transition-colors"
          >
            This Weekend
          </button>
          <button
            onClick={() => setPreset("month")}
            className="px-3 py-1.5 text-xs font-bold bg-[#f6f5f4] text-[rgba(0,0,0,0.8)] border border-[rgba(0,0,0,0.05)] rounded hover:bg-[#eaeaeb] transition-colors"
          >
            This Month
          </button>
          <button
            onClick={() => setPreset("next_month")}
            className="px-3 py-1.5 text-xs font-bold bg-[#f6f5f4] text-[rgba(0,0,0,0.8)] border border-[rgba(0,0,0,0.05)] rounded hover:bg-[#eaeaeb] transition-colors"
          >
            Next Month
          </button>
        </div>

        <div className="pt-2 border-t border-[rgba(0,0,0,0.05)]">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center justify-between w-full text-xs font-bold text-[#615d59] hover:text-black transition-colors"
          >
            <span>Advanced / Custom Dates</span>
            {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {isAdvancedOpen && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="relative group">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98] pointer-events-none" />
                <input
                  type="date"
                  value={toInputDate(dateRange?.from)}
                  onChange={onFromChange}
                  className="w-full pl-9 pr-2 py-2 text-xs bg-white border border-[rgba(0,0,0,0.1)] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#097fe8]/50 focus:border-[#097fe8] text-[rgba(0,0,0,0.95)] transition-all"
                />
              </div>
              <div className="relative group">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a39e98] pointer-events-none" />
                <input
                  type="date"
                  value={toInputDate(dateRange?.to)}
                  onChange={onToChange}
                  className="w-full pl-9 pr-2 py-2 text-xs bg-white border border-[rgba(0,0,0,0.1)] rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#097fe8]/50 focus:border-[#097fe8] text-[rgba(0,0,0,0.95)] transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={close}
        disabled={isSearching}
        className="mt-2 w-full py-4 text-base font-bold flex items-center justify-center gap-2"
      >
        {isSearching ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Searching...</span>
          </>
        ) : (
          `Show ${filteredShows.length} ${filteredShows.length === 1 ? "Result" : "Results"}`
        )}
      </Button>

      {Boolean(searchQuery || selectedVenue || dateRange?.from) && (
        <button
          onClick={() => {
            searchQueryStore.set("");
            selectedVenueStore.set(null);
            dateRangeStore.set(undefined);
          }}
          className="w-full py-3 text-sm font-bold text-[#615d59] hover:text-slate-900 transition-colors bg-transparent hover:bg-slate-100 rounded-[4px]"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
