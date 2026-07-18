import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { AQIReading, Coordinates, RouteOption } from "../../types";
import { MapFallback } from "./MapFallback";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

interface MapViewProps {
  center: Coordinates;
  aqiGrid: AQIReading[];
  destination: Coordinates | null;
  routes: RouteOption[];
  selectedRouteId: string | null;
  onMapClick: (coords: Coordinates) => void;
}

const AQI_SOURCE_ID = "aqi-heatmap";
const ROUTE_SOURCE_PREFIX = "route-";

export function MapView(props: MapViewProps) {
  if (!MAPBOX_TOKEN) {
    return <MapFallback {...props} />;
  }
  return <MapboxMap {...props} />;
}

function MapboxMap({ center, aqiGrid, destination, routes, selectedRouteId, onMapClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const currentMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN!;
    const map = new mapboxgl.Map({
      container: containerRef.current!,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [center.lon, center.lat],
      zoom: 12.5,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => setLoaded(true));
    map.on("click", (e) => onMapClick({ lat: e.lngLat.lat, lon: e.lngLat.lng }));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [center.lon, center.lat], essential: true });

    if (!currentMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "current-location-marker";
      currentMarkerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([center.lon, center.lat]).addTo(map);
    } else {
      currentMarkerRef.current.setLngLat([center.lon, center.lat]);
    }
  }, [center.lat, center.lon]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (destination) {
      if (!destMarkerRef.current) {
        destMarkerRef.current = new mapboxgl.Marker({ color: "#3b82f6" })
          .setLngLat([destination.lon, destination.lat])
          .addTo(map);
      } else {
        destMarkerRef.current.setLngLat([destination.lon, destination.lat]);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
  }, [destination?.lat, destination?.lon]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || aqiGrid.length === 0) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: aqiGrid.map((point) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [point.lon, point.lat] },
        properties: { aqi: point.aqi, color: point.color },
      })),
    };

    const existing = map.getSource(AQI_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(geojson);
    } else {
      map.addSource(AQI_SOURCE_ID, { type: "geojson", data: geojson });
      map.addLayer({
        id: `${AQI_SOURCE_ID}-glow`,
        type: "circle",
        source: AQI_SOURCE_ID,
        paint: {
          "circle-radius": 55,
          "circle-color": ["get", "color"],
          "circle-opacity": 0.22,
          "circle-blur": 1,
        },
      });
      map.addLayer({
        id: `${AQI_SOURCE_ID}-core`,
        type: "circle",
        source: AQI_SOURCE_ID,
        paint: {
          "circle-radius": 6,
          "circle-color": ["get", "color"],
          "circle-opacity": 0.9,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff33",
        },
      });
    }
  }, [aqiGrid, loaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    // clear previously drawn routes
    const style = map.getStyle();
    style?.layers?.forEach((layer) => {
      if (layer.id.startsWith(ROUTE_SOURCE_PREFIX)) {
        if (map.getLayer(layer.id)) map.removeLayer(layer.id);
      }
    });
    Object.keys(style?.sources ?? {}).forEach((sourceId) => {
      if (sourceId.startsWith(ROUTE_SOURCE_PREFIX) && map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });

    routes.forEach((route) => {
      const sourceId = `${ROUTE_SOURCE_PREFIX}${route.id}`;
      const isSelected = route.id === selectedRouteId;
      const color =
        route.healthRating === "recommended" ? "#22c55e" : route.healthRating === "moderate" ? "#eab308" : "#ef4444";

      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: route.geometry.map((p) => [p.lon, p.lat]),
          },
          properties: {},
        },
      });
      map.addLayer({
        id: sourceId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": color,
          "line-width": isSelected ? 6 : 3,
          "line-opacity": isSelected || selectedRouteId === null ? 0.95 : 0.35,
        },
      });
    });

    if (routes.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      routes.forEach((r) => r.geometry.forEach((p) => bounds.extend([p.lon, p.lat])));
      map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
    }
  }, [routes, selectedRouteId, loaded]);

  return <div ref={containerRef} className="h-full w-full" />;
}
