import { apiClient } from "./client";
import type { SearchResult } from "../../types";

export async function searchLocations(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const res = await apiClient.get("/search", { params: { q: query } });
  return res.data.results;
}
