export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          primary: "#6366f1", // Indigo-500
          secondary: "#a855f7", // Purple-500
          accent: "#22d3ee", // Cyan-400
          dark: "#0f172a", // Slate-900
          light: "#1e293b", // Slate-800
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
