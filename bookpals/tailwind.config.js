/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./src/components/ui/**/*.{js,jsx}",
    "./src/components/layout/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo
        "primary-dark": "#4f46e5", // Darker indigo
        secondary: "#8b5cf6", // Purple
        "secondary-dark": "#7c3aed", // Darker purple
        dark: "#111827", // Gray-900
        "dark-light": "#1f2937", // Gray-800
        "dark-lighter": "#374151", // Gray-700
      },
      backgroundImage: {
        "aurora-gradient":
          "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "aurora-shine": "aurora-shine 8s ease-in-out infinite",
      },
      keyframes: {
        "aurora-shine": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
