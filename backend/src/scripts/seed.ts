import { initDataStore } from "../services/dataStore.js";
import { seedPlaces } from "../services/places.service.js";
import { seedAdvisories } from "../services/advisories.service.js";

async function run() {
  const store = await initDataStore();
  await Promise.all([seedPlaces(), seedAdvisories()]);
  console.log(`Seeded places and health advisories into ${store.backend} store.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
