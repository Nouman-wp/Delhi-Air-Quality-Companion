import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { searchLocations } from "../../services/api/search.api";
import type { SearchResult } from "../../types";

export function SearchBar({ onSelect }: { onSelect: (result: SearchResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

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

      {open && (query.trim().length >= 2 || loading) && (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto scrollbar-thin rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-glass p-1.5">
          {loading && <p className="px-3 py-2.5 text-sm text-white/40">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-2.5 text-sm text-white/40">No matches found.</p>
          )}
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(result);
                setQuery(result.name);
                setOpen(false);
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
            >
              <p className="text-sm font-medium">{result.name}</p>
              <p className="text-xs text-white/40">{result.placeName}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
