/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // or 'media' or 'class'
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        nm: ["Neue Machina", "serif"],
        nmbold: ["Neue Machina Ultrabold", "serif"],
        MessinaSans: ["Messina Sans", "sans-serif"],
        MessinaSansBook: ["Messina Sans Book", "sans-serif"],
      },
      /* add a new gray color family */
      colors: {
        bbgray: {
          50: '#f3f3f3',
          100: '#dcdcdc',
          200: '#bebebe',
          300: '#a4a4a4',
          400: '#8c8c8c',
          500: '#6f6f6f',
          600: '#565656',
          700: '#3d3d3d',
          800: '#282828',
          900: '#171717',
          1000: '#0f0f0f',
        },
      },
    },
  },
};
export default config;