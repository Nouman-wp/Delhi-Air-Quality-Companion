import type { DataStore } from "../types/store.types.js";
import { MemoryStore } from "./memoryStore.service.js";
import { ElasticStore } from "./elasticStore.service.js";
import { env } from "../config/env.js";

let store: DataStore | null = null;

export async function initDataStore(): Promise<DataStore> {
  if (store) return store;

  if (env.elasticsearchNode) {
    const elastic = new ElasticStore();
    const reachable = await elastic.ping();
    if (reachable) {
      await elastic.init();
      store = elastic;
      console.log("[dataStore] Connected to Elasticsearch — geo, time-series and vector search are live.");
      return store;
    }
    console.warn(
      "[dataStore] ELASTICSEARCH_NODE set but unreachable. Falling back to in-memory store so the app keeps working."
    );
  } else {
    console.warn(
      "[dataStore] No ELASTICSEARCH_NODE configured. Running on in-memory store (data resets on restart)."
    );
  }

  const memory = new MemoryStore();
  await memory.init();
  store = memory;
  return store;
}

export function getStore(): DataStore {
  if (!store) {
    throw new Error("Data store accessed before initialization. Call initDataStore() at startup.");
  }
  return store;
}
