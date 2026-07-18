const LEGEND = [
  { label: "Good", color: "#22c55e" },
  { label: "Moderate", color: "#eab308" },
  { label: "Unhealthy (S.G.)", color: "#f97316" },
  { label: "Unhealthy", color: "#ef4444" },
  { label: "Very Unhealthy", color: "#a855f7" },
];

export function AQILegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/90 backdrop-blur-lg px-4 py-2.5 shadow-glass text-xs">
      {LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-white/60">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
