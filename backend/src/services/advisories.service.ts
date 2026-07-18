import { getStore } from "./dataStore.js";
import { healthAdvisories } from "../data/healthAdvisories.js";
import { embedText } from "../utils/embedding.util.js";
import type { AdvisoryMatch } from "../types/store.types.js";

export async function seedAdvisories(): Promise<void> {
  const withVectors = healthAdvisories.map((a) => ({
    ...a,
    vector: embedText(`${a.text} ${a.tags.join(" ")}`),
  }));
  await getStore().upsertAdvisories(withVectors);
}

export async function retrieveAdvisories(query: string, topK = 4): Promise<AdvisoryMatch[]> {
  const vector = embedText(query);
  return getStore().searchAdvisories(query, vector, topK);
}
