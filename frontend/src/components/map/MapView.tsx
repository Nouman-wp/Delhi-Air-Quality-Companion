import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AQIReading, Coordinates, RouteOption } from "../../types";
import { recommendedPlaces, type RecommendedPlace } from "../../data/recommendedPlaces";

interface MapViewProps {
  center: Coordinates;
  aqiGrid: AQIReading[];
  destination: Coordinates | null;
  routes: RouteOption[];
  selectedRouteId: string | null;
  onMapClick: (coords: Coordinates) => void;
  onSelectPlace: (place: RecommendedPlace) => void;
}

const RATING_COLOR: Record<RouteOption["healthRating"], string> = {
  recommended: "#22c55e",
  moderate: "#eab308",
  avoid: "#ef4444",
};

// Custom divIcons instead of L.Icon — avoids Vite's default marker-image
// bundling issue (leaflet's default icon URLs don't resolve correctly
// through the bundler without extra asset config).
const currentLocationIcon = L.divIcon({
  className: "",
  html: '<div class="current-location-marker"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const destinationIcon = L.divIcon({
  className: "",
  html: '<div class="destination-marker"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const recommendedIcon = L.divIcon({
  className: "",
  html: '<div class="recommended-marker"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ClickHandler({ onMapClick }: { onMapClick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

function RecenterOnChange({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lon], map.getZoom(), { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lon]);
  return null;
}

function FitRouteBounds({ routes }: { routes: RouteOption[] }) {
  const map = useMap();
  useEffect(() => {
    if (routes.length === 0) return;
    const points = routes.flatMap((r) => r.geometry.map((p): [number, number] => [p.lat, p.lon]));
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [80, 80], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);
  return null;
}

export function MapView({ center, aqiGrid, destination, routes, selectedRouteId, onMapClick, onSelectPlace }: MapViewProps) {
  return (
    <MapContainer
      center={[center.lat, center.lon]}
      zoom={12.5}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <ClickHandler onMapClick={onMapClick} />
      <RecenterOnChange center={center} />
      <FitRouteBounds routes={routes} />

      {aqiGrid.map((point, idx) => (
        <Circle
          key={idx}
          center={[point.lat, point.lon]}
          radius={900}
          pathOptions={{ color: point.color, fillColor: point.color, fillOpacity: 0.18, stroke: false }}
        />
      ))}
      {aqiGrid.map((point, idx) => (
        <CircleMarker
          key={`core-${idx}`}
          center={[point.lat, point.lon]}
          radius={6}
          pathOptions={{ color: "#ffffff88", weight: 1, fillColor: point.color, fillOpacity: 0.9 }}
        />
      ))}

      {/* Recommended-place pins, hidden once a destination is chosen to keep the route view clean */}
      {!destination &&
        recommendedPlaces.map((place) => (
          <Marker
            key={place.name}
            position={[place.lat, place.lon]}
            icon={recommendedIcon}
            eventHandlers={{ click: () => onSelectPlace(place) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {place.name}
            </Tooltip>
          </Marker>
        ))}

      <Marker position={[center.lat, center.lon]} icon={currentLocationIcon} />
      {destination && <Marker position={[destination.lat, destination.lon]} icon={destinationIcon} />}

      {routes.map((route) => {
        const isSelected = route.id === selectedRouteId;
        return (
          <Polyline
            key={route.id}
            positions={route.geometry.map((p): [number, number] => [p.lat, p.lon])}
            pathOptions={{
              color: RATING_COLOR[route.healthRating],
              weight: isSelected ? 6 : 3,
              opacity: isSelected || selectedRouteId === null ? 0.95 : 0.35,
            }}
          />
        );
      })}
    </MapContainer>
  );
}
