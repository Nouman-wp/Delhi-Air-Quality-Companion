import { useEffect, useRef, useState } from "react";
import { Search, X, MapPin } from "lucide-react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { searchLocations } from "../../services/api/search.api";
import { recommendedPlaces } from "../../data/recommendedPlaces";
import { categoryIcon } from "../../utils/placeIcons";
import type { SearchResult } from "../../types";

export function SearchBar({ onSelect }: { onSelect: (result: SearchResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const isSearching = query.trim().length >= 2;

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchLocations(debouncedQuery)
      .then((res) => {
        if (!cancelled) setResults(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function choose(result: SearchResult) {
    onSelect(result);
    setQuery(result.name);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card/90 backdrop-blur-lg px-4 py-3 shadow-glass">
        <Search size={18} className="text-white/40 shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search a destination in Delhi…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
        />
        {query && (
          <button onClick={() => setQuery("")} className="shrink-0 text-white/40 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-80 overflow-y-auto scrollbar-thin rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-glass p-1.5">
          {isSearching ? (
            <>
              {loading && <p className="px-3 py-2.5 text-sm text-white/40">Searching…</p>}
              {!loading && results.length === 0 && (
                <p className="px-3 py-2.5 text-sm text-white/40">No matches found.</p>
              )}
              {results.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => choose(result)}
                  className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-white/40" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{result.name}</p>
                    <p className="truncate text-xs text-white/40">{result.placeName}</p>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <>
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/40">
                Popular in Delhi
              </p>
              {recommendedPlaces.map((place) => (
                <button
                  key={place.name}
                  onClick={() =>
                    choose({ name: place.name, placeName: place.area, lat: place.lat, lon: place.lon })
                  }
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="shrink-0">{categoryIcon(place.category)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{place.name}</p>
                    <p className="truncate text-xs text-white/40">{place.area}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
