import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  strong?: boolean;
}

export function GlassCard({ children, className, strong, ...rest }: GlassCardProps) {
  return (
    <div className={clsx(strong ? "glass-strong" : "glass", "rounded-2xl", className)} {...rest}>
      {children}
    </div>
  );
}
