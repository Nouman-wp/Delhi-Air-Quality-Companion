import type { ReactNode } from "react";
import clsx from "clsx";

export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", className)}
      style={
        color
          ? { backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }
          : undefined
      }
    >
      {children}
    </span>
  );
}
