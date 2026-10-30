/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // One small palette. Status colours are only used where they carry meaning.
      colors: {
        canvas: "#F7F8FA",   // page background
        surface: "#FFFFFF",  // cards, sidebar
        ink: "#1F2430",      // main text (charcoal)
        muted: "#667085",    // secondary text
        line: "#E4E7EC",     // borders and dividers
        accent: { DEFAULT: "#2F5FA7", hover: "#274F8C", soft: "#EAF0F9" }, // the one blue
        ok: { DEFAULT: "#2E7D4F", soft: "#E8F3EC" },     // success / resolved
        warn: { DEFAULT: "#9A6700", soft: "#FBF1DC" },   // pending / needs a human
        bad: { DEFAULT: "#B42318", soft: "#FDECEA" },    // errors only
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        dot: { "0%,80%,100%": { transform: "translateY(0)", opacity: 0.4 }, "40%": { transform: "translateY(-3px)", opacity: 1 } },
      },
      animation: {
        dot: "dot 1.2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
