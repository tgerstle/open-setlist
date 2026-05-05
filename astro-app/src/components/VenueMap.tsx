import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

if (typeof window !== "undefined") {
  import("leaflet/dist/leaflet.css");
}

// Fix for default marker icons in React-Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom MKE Sunrise Marker (Gold/Blue)
const mkeIcon = L.divIcon({
  className: "mke-marker",
  html: `
    <div class="relative w-8 h-8 bg-mke-gold border-2 border-mke-blue-dark rounded-full shadow-lg flex items-center justify-center">
      <div class="w-4 h-4 bg-mke-blue-dark rounded-full opacity-30 animate-ping absolute"></div>
      <span class="text-[10px] font-black text-mke-blue-dark">MKE</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export type ThemeColor = 'blue' | 'sky' | 'fuchsia' | 'orange' | 'red' | 'amber' | 'indigo' | 'slate' | 'purple' | 'emerald' | 'teal' | 'pink' | 'lime' | 'cyan' | 'yellow';

interface Venue {
  id: string;
  name: string;
  short_name?: string;
  theme_color?: ThemeColor;
  address: string;
  latitude: number | null;
  longitude: number | null;
  neighborhood: string | null;
}

export default function VenueMap({ venues }: { venues: Venue[] }) {
  const mkeCenter: [number, number] = [43.0389, -87.9065]; // Downtown MKE

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
      <MapContainer
        center={mkeCenter}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venues.map(
          (venue) =>
            venue.latitude &&
            venue.longitude && (
              <Marker
                key={venue.id}
                position={[venue.latitude, venue.longitude]}
                icon={mkeIcon}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-black text-mke-blue-dark text-lg mb-1 leading-none">
                      {venue.name}
                    </h3>
                    <p className="text-xs font-bold text-mke-blue-light uppercase tracking-widest mb-2">
                      {venue.neighborhood}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {venue.address}
                    </p>
                    <a
                      href={`/venues/${venue.id}`}
                      className="block text-center py-2 bg-mke-blue-dark text-white font-bold rounded hover:bg-mke-gold hover:text-mke-blue-dark transition-colors text-xs"
                    >
                      View Venue Schedule
                    </a>
                  </div>
                </Popup>
              </Marker>
            ),
        )}
      </MapContainer>
    </div>
  );
}
