import type { Config } from "tailwindcss";

// Full 0-100 opacity scale so any `/N` color-opacity modifier (e.g. border-ink/8) works,
// not just Tailwind's sparse default stops.
const fullOpacityScale = Object.fromEntries(
  Array.from({ length: 101 }, (_, i) => [String(i), String(i / 100)])
);

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      opacity: fullOpacityScale,
      colors: {
        ink: {
          DEFAULT: "#1c1a17",
          soft: "#3a3632",
        },
        cream: {
          DEFAULT: "#faf7f2",
          dark: "#f1ebe1",
        },
        sand: "#e7ddcd",
        clay: "#b08968",
        moss: "#5c6b56",
        rust: "#a8532f",
        accent: "#8a6f4e",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,26,23,0.04), 0 8px 24px -12px rgba(28,26,23,0.15)",
        pop: "0 12px 32px -8px rgba(28,26,23,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease forwards",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
