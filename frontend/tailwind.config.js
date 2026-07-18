/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // All theme-aware tokens are driven by CSS variables (see index.css),
        // defined as `<channels> / <alpha-value>` so Tailwind's opacity
        // modifiers (bg-card/90, text-white/60, …) keep working in both themes.
        // `white` is intentionally remapped to the foreground colour so the
        // large body of existing `text-white` / `bg-white/x` utility classes
        // invert automatically between dark and light mode.
        background: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        white: "rgb(var(--c-fg) / <alpha-value>)",
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#60a5fa",
        },
        aqi: {
          good: "#22c55e",
          moderate: "#eab308",
          usg: "#f97316",
          unhealthy: "#ef4444",
          veryUnhealthy: "#a855f7",
          hazardous: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.37)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
