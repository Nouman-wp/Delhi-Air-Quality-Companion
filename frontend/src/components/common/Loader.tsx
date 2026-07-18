import clsx from "clsx";

export function Loader({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <div
      className={clsx("animate-spin rounded-full border-2 border-white/20 border-t-accent", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function LoaderOverlay({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-white/50">
      <Loader size={28} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
