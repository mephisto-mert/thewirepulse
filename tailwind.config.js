/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wire: {
          dark: "#0a0c10",
          card: "#12151c",
          border: "#1f2430",
          red: "#ef233c",
          redGlow: "#d90429",
          gray: "#8d99ae",
          white: "#edf2f4"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
