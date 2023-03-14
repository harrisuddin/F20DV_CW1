/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.js"],
  theme: {
    extend: {
      strokeWidth: {
        1.5: 1.5,
      },
      colors: {
        orange: {
          75: "#FFF2E1",
        },
      },
    },
  },
  plugins: [],
};
