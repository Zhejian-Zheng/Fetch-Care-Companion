import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#152238",
        fetch: {
          pink: "#ff5fa2",
          rose: "#fff3f8",
          mint: "#9be7d1",
          lemon: "#ffe08a",
          blue: "#dff2ff"
        }
      },
      boxShadow: {
        soft: "0 18px 48px rgba(21, 34, 56, 0.10)",
        phone: "0 30px 90px rgba(21, 34, 56, 0.20)"
      }
    }
  },
  plugins: []
};

export default config;
