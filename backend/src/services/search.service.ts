import { delhiLandmarks } from "../data/delhiLandmarks.js";

export interface SearchResult {
  name: string;
  placeName: string;
  lat: number;
  lon: number;
}

const DELHI_VIEWBOX = "76.8,28.9,77.5,28.4"; // left,top,right,bottom around the NCR

// Nominatim (OpenStreetMap's geocoder) needs no API key, but its usage
// policy requires a descriptive User-Agent identifying the calling app.
const NOMINATIM_USER_AGENT = "AirWiseAI/1.0 (Delhi air quality companion, demo project)";

async function searchWithNominatim(query: string): Promise<SearchResult[] | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "6");
    url.searchParams.set("viewbox", DELHI_VIEWBOX);
    url.searchParams.set("bounded", "1");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": NOMINATIM_USER_AGENT },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as any[];
    if (!Array.isArray(json) || json.length === 0) return null;

    return json.map((f): SearchResult => ({
      name: f.name || f.display_name.split(",")[0],
      placeName: f.display_name,
      lat: parseFloat(f.lat),
      lon: parseFloat(f.lon),
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
  const live = await searchWithNominatim(query);
  if (live && live.length > 0) return live;
  return searchLocal(query);
}
