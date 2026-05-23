import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

if (typeof window !== "undefined") {
	import("leaflet/dist/leaflet.css");
}

// Fix for default marker icons in React-Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const _DefaultIcon = L.icon({
	iconUrl: markerIcon.src,
	shadowUrl: markerShadow.src,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

// Custom DEMO Sunrise Marker (Gold/Blue)
const mkeIcon = L.divIcon({
	className: "brand-marker",
	html: `
    <div class="relative w-8 h-8 bg-brand-secondary border-2 border-brand-primary rounded-full shadow-lg flex items-center justify-center">
      <div class="w-4 h-4 bg-brand-primary rounded-full opacity-30 animate-ping absolute"></div>
      <span class="text-[10px] font-black text-brand-primary">DEMO</span>
    </div>
  `,
	iconSize: [32, 32],
	iconAnchor: [16, 32],
});

export type ThemeColor =
	| "blue"
	| "sky"
	| "fuchsia"
	| "orange"
	| "red"
	| "amber"
	| "indigo"
	| "slate"
	| "purple"
	| "emerald"
	| "teal"
	| "pink"
	| "lime"
	| "cyan"
	| "yellow";

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
	const mapCenter: [number, number] = [39.8283, -98.5795]; // Downtown DEMO

	return (
		<div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
			<MapContainer
				center={mapCenter}
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
										<h3 className="font-black text-brand-primary text-lg mb-1 leading-none">
											{venue.name}
										</h3>
										<p className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
											{venue.neighborhood}
										</p>
										<p className="text-sm text-gray-600 mb-3">
											{venue.address}
										</p>
										<a
											href={`/venues/${venue.id}`}
											className="block text-center py-2 bg-brand-primary text-white font-bold rounded hover:bg-brand-secondary hover:text-brand-primary transition-colors text-xs"
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
