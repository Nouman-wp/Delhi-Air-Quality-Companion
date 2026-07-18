/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0c",
        surface: "#131317",
        card: "#1a1a20",
        border: "#2a2a32",
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
    },
  },
  plugins: [],
};
