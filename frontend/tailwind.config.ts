import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        linen: "#fffaf3",
        tomato: "#ef4b35",
        basil: "#176f4d",
        steel: "#eef2f4"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(16, 24, 32, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
