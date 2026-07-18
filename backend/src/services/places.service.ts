import { getStore } from "./dataStore.js";
import { delhiParks } from "../data/delhiParks.js";
import { getCurrentAqi } from "./aqi.service.js";
import type { Coordinates, Place } from "../types/index.js";

export async function seedPlaces(): Promise<void> {
  await getStore().upsertPlaces(delhiParks);
}

export async function findNearbySafePlaces(coords: Coordinates, radiusKm = 15): Promise<Place[]> {
  const store = getStore();
  let nearby = await store.searchNearbyPlaces(coords, radiusKm);

  if (nearby.length === 0) {
    // widen the search rather than showing an empty result
    nearby = await store.searchNearbyPlaces(coords, radiusKm * 2);
  }

  const withAqi = await Promise.all(
    nearby.slice(0, 10).map(async (place) => {
      const reading = await getCurrentAqi(place.location);
      return { ...place, aqi: reading.aqi };
    })
  );

  return withAqi.sort((a, b) => (a.aqi ?? 999) - (b.aqi ?? 999));
}
