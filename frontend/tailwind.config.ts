import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#005477",
          dark: "#003f5c",
          light: "#4A90A4",
          lighter: "#E6F2F5",
        },
        accent: {
          DEFAULT: "#FFC107",
          dark: "#F0B400",
        },
        background: {
          DEFAULT: "#F8FAFC",
          light: "#FFFFFF",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#4A5568",
          muted: "#718096",
        },
        border: {
          DEFAULT: "#E2E8F0",
          light: "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        section: "4rem",
        "section-md": "6rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;

