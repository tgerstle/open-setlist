import React from "react";
import { Calendar, List, Map } from "lucide-react";
import { useStore } from "@nanostores/react";
import type { ViewType } from "../../types/models";
import { activeViewStore } from "../../stores/appState";

interface AppHeaderProps {
  isDev?: boolean;
}

export function AppHeader({ isDev }: AppHeaderProps) {
  const activeView = useStore(activeViewStore);
  const onViewChange = (view: ViewType) => activeViewStore.set(view);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[rgba(0,0,0,0.1)]">
      <div className="flex h-14 items-center px-4 md:px-6 max-w-7xl mx-auto w-full">
        {/* Brand */}
        <a
          href="/"
          className="flex items-center gap-2 mr-4 flex-1 hover:no-underline group"
        >
          <div className="w-8 h-8 bg-[#0075de] rounded-[4px] flex items-center justify-center text-white font-bold tracking-tighter transition-transform group-hover:scale-105">
            MKE
          </div>
          <span className="font-bold text-[rgba(0,0,0,0.95)] tracking-tight group-hover:text-[#0075de] transition-colors">
            Setlist
          </span>
        </a>

        {/* View Toggle (Navigation) */}
        <div className="flex items-center p-1 bg-[#f6f5f4] rounded-[8px] border border-[rgba(0,0,0,0.05)]">
          <a
            href="/"
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-[4px] transition-all ${
              activeView === "feed"
                ? "bg-white text-[rgba(0,0,0,0.95)] shadow-sm"
                : "text-[#615d59] hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.02)]"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Feed</span>
          </a>

          <a
            href="/calendar"
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-[4px] transition-all ${
              activeView === "month"
                ? "bg-white text-[rgba(0,0,0,0.95)] shadow-sm"
                : "text-[#615d59] hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.02)]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </a>

          <a
            href="/map"
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-[4px] transition-all ${
              activeView === "map"
                ? "bg-white text-[rgba(0,0,0,0.95)] shadow-sm"
                : "text-[#615d59] hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.02)]"
            }`}
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </a>
        </div>

        {/* Right side spacer to balance the flex layout */}
        <div className="flex-1 flex justify-end">
          {isDev && (
            <a
              href="/admin/dashboard"
              className="text-sm font-medium text-[#615d59] hover:text-[rgba(0,0,0,0.95)] hidden sm:block"
            >
              Admin
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
