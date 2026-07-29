import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neutral scale used for backgrounds/surfaces/text in both themes
        canvas: {
          light: "#FAFAFA",
          dark: "#0B0B0F",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#151519",
        },
        // Primary accent: electric indigo
        accent: {
          50: "#EEF0FF",
          100: "#DFE1FF",
          300: "#A8ADFF",
          500: "#5B5FEF",
          600: "#4A4DDB",
          700: "#3B3EBD",
        },
        // Secondary accent: spark yellow (used sparingly — badges, alerts)
        spark: {
          400: "#FFD23F",
          500: "#F5C518",
        },
        danger: {
          500: "#EF4444",
          600: "#DC2626",
        },
        success: {
          500: "#22C55E",
          600: "#16A34A",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        "card-dark": "0 1px 2px 0 rgb(0 0 0 / 0.3), 0 1px 3px 0 rgb(0 0 0 / 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
