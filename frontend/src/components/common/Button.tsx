import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Loader } from "./Loader";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  loading,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-accent hover:bg-accent-hover text-white",
    secondary: "bg-white/10 hover:bg-white/15 text-white border border-border",
    ghost: "bg-transparent hover:bg-white/5 text-white/80",
    danger: "bg-red-500/90 hover:bg-red-500 text-white",
  };

  return (
    <button className={clsx(base, variants[variant], className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader size={16} />}
      {children}
    </button>
  );
}
