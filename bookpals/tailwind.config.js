/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          dark: "#6D28D9",
          light: "#8B5CF6",
        },
        dark: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
          lighter: "#334155",
        },
        aurora: {
          purple: "#7C3AED",
          blue: "#3B82F6",
          green: "#10B981",
        },
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
