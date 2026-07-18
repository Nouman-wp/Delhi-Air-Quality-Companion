import { env } from "../config/env.js";
import { delhiLandmarks } from "../data/delhiLandmarks.js";

export interface SearchResult {
  name: string;
  placeName: string;
  lat: number;
  lon: number;
}

const DELHI_BBOX = "76.8,28.4,77.5,28.9"; // roughly the NCR bounding box

async function searchWithMapbox(query: string): Promise<SearchResult[] | null> {
  if (!env.mapboxToken) return null;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?bbox=${DELHI_BBOX}&limit=6&access_token=${env.mapboxToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as any;
    if (!json.features) return null;

    return json.features.map((f: any): SearchResult => ({
      name: f.text,
      placeName: f.place_name,
      lat: f.center[1],
      lon: f.center[0],
    }));
  } catch {
    return null;
  }
}

function searchLocal(query: string): SearchResult[] {
  const lower = query.toLowerCase();
  return delhiLandmarks
    .filter((l) => l.name.toLowerCase().includes(lower) || l.placeName.toLowerCase().includes(lower))
    .map((l) => ({ name: l.name, placeName: l.placeName, lat: l.lat, lon: l.lon }));
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (query.trim().length < 2) return [];
  const live = await searchWithMapbox(query);
  if (live && live.length > 0) return live;
  return searchLocal(query);
}
