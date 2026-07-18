import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "../../contexts/ThemeContext";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={clsx(
        "relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white",
        className
      )}
    >
      <Sun
        size={18}
        className={clsx(
          "absolute transition-all duration-300",
          isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
      <Moon
        size={18}
        className={clsx(
          "absolute transition-all duration-300",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        )}
      />
    </button>
  );
}
