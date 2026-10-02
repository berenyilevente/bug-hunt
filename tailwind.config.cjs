/**
 * The overlay's own Tailwind, compiled once into the CSS its shadow root
 * carries. The host app's Tailwind never sees these files, and the host's
 * styles never reach inside the shadow root.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./src/**/*.tsx', '!./src/**/*.test.tsx'],
  theme: { extend: {} },
  plugins: [],
};
