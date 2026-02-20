/** @type {import('tailwindcss').Config} */
import tinycolor from 'tinycolor2';
import { PRIMARY_COLOR } from './src/config/siteConfig.js';

function generatePalette(hex) {
  const base = tinycolor(hex);
  return {
    50:  tinycolor.mix('#ffffff', hex, 10).toHexString(),
    100: tinycolor.mix('#ffffff', hex, 20).toHexString(),
    200: tinycolor.mix('#ffffff', hex, 40).toHexString(),
    300: tinycolor.mix('#ffffff', hex, 60).toHexString(),
    400: tinycolor.mix('#ffffff', hex, 80).toHexString(),
    500: base.toHexString(),
    600: base.darken(8).toHexString(),
    700: base.darken(16).toHexString(),
    800: base.darken(24).toHexString(),
    900: base.darken(32).toHexString(),
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: generatePalette(PRIMARY_COLOR),
      },
    },
  },
  plugins: [],
}