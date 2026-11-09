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
        pulse: {
          bg: "#090b10",
          surface: "#11141c",
          elevated: "#181d28",
          border: "#232938",
          red: "#ef233c",
          crimson: "#d90429",
          muted: "#94a3b8",
          light: "#f8fafc",
          accent: "#38bdf8"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        editorial: ["'Newsreader'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      }
    },
  },
  plugins: [],
}
