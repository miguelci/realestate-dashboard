import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm neutral palette
        background: "#FAFAF9",
        surface: "#FFFFFF",
        border: "#E7E5E4",
        "text-primary": "#1C1917",
        "text-secondary": "#78716C",
        accent: "#0D9488",
        "badge-sale": "#DC2626",
        "badge-rent": "#059669",
        hover: "#F5F5F4",
      },
    },
  },
  plugins: [],
};
export default config;
