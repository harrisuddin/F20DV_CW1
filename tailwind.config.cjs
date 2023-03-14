/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.js"],
  theme: {
    extend: {
      strokeWidth: {
        1.5: 1.5,
      },
      opacity: {
        15: 0.15,
      },
    },
  },
  plugins: [],
};
