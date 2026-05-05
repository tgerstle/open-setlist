import React, { useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useStore } from "@nanostores/react";
import {
  selectedShowStore,
  eventsStore,
  selectedVenueStore,
} from "../../stores/appState";
import { filteredShowsStore } from "../../stores/filteredShows";
import { ShowPill } from "../ui/ShowPill";
import type { Show, Venue } from "../../types/models";
import {
  aggregateShowsByVenue,
  type VenueData,
} from "../../utils/show-transformers";

// Lazy-load Leaflet CSS only when this component is mounted
if (typeof window !== "undefined") {
  import("leaflet/dist/leaflet.css");
}

// Fix Leaflet's default icon path issue
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapViewProps {
  initialShows?: Show[];
  venues: Venue[];
}

// Controller component to handle flyTo requests
function MapController({
  center,
  zoom,
  selectedVenueId,
  venueData,
}: {
  center: [number, number];
  zoom: number;
  selectedVenueId?: string | null;
  venueData: VenueData[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedVenueId) {
      const v = venueData.find((vd) => vd.venue.id === selectedVenueId);
      if (v && v.venue.coordinates) {
        const parts = v.venue.coordinates
          .split(",")
          .map((s: string) => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          map.flyTo([parts[0], parts[1]], 16, { animate: true, duration: 1.5 });
        }
      }
    } else {
      map.flyTo(center, 13, { animate: true, duration: 1.5 });
    }
  }, [selectedVenueId, map, venueData]);

  return null;
}

export function MapView({ initialShows = [], venues }: MapViewProps) {
  const filteredShows = useStore(filteredShowsStore);
  const rawShows = useStore(eventsStore);
  const selectedVenueId = useStore(selectedVenueStore);

  // Use SSR data initially to prevent layout shifts
  const shows = rawShows.length > 0 ? filteredShows : initialShows;

  const onShowClick = (show: Show) => {
    selectedShowStore.set(show);
  };

  // Aggregate shows by venue for the map pins
  const venueData = useMemo(() => {
    return aggregateShowsByVenue(shows, venues);
  }, [shows, venues]);

  // Center of Milwaukee
  const center: [number, number] = [43.0389, -87.9065];

  return (
    <motion.div
      className="w-full h-[600px] border border-slate-200 rounded-xl shadow-(--shadow-lg) overflow-hidden z-10 relative bg-white"
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
      >
        <MapController
          center={center}
          zoom={13}
          selectedVenueId={selectedVenueId}
          venueData={venueData}
        />

        {/* Subtle, minimal tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <>
          {venueData.map((vd) => {
            if (!vd.venue.coordinates) return null;

            const parts = vd.venue.coordinates
              .split(",")
              .map((s: string) => parseFloat(s.trim()));
            if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1]))
              return null;

            const hasShows = vd.shows.length > 0;
            const iconHtml = `
              <div class="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-md text-[10px] font-bold text-white transition-all transform hover:scale-110 ${
                hasShows ? "bg-primary" : "bg-slate-400"
              }">
                ${hasShows ? vd.shows.length : ""}
              </div>
            `;

            const customIcon = L.divIcon({
              html: iconHtml,
              className: "custom-venue-marker",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
              popupAnchor: [0, -12],
            });

            return (
              <Marker
                key={vd.venue.id}
                position={[parts[0], parts[1]]}
                icon={customIcon}
              >
                <Popup className="venue-popup" minWidth={280} maxWidth={320}>
                  <div className="font-sans">
                    <div className="pb-3 mb-3 border-b border-slate-100">
                      <h3 className="font-bold text-lg tracking-tight text-slate-900 leading-tight mb-0.5">
                        {vd.venue.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {vd.venue.neighborhood || "Milwaukee, WI"}
                      </p>
                    </div>

                    <div className="space-y-1 max-h-[200px] overflow-y-auto no-scrollbar pr-1">
                      {vd.shows.length > 0 ? (
                        vd.shows.map((show) => (
                          <div key={show.id} className="w-full">
                            <ShowPill
                              show={show}
                              onClick={() => onShowClick(show)}
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-300 italic">
                          No events found currently.
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </>
      </MapContainer>
    </motion.div>
  );
}
