/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': "320px",
      'sm': "425px",
      'md600': "601px",
      'md': "768px",
      'lg': "1024px",
      'xl': "1280px",
      "2xl": "1440px",
      "3xl": "1920px",
      "4xl": "2560px",
    },
    extend: {},
    container: {
      center: true, // Center the container by default
      screens: {
        sm: '420px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1800px',
      },
    },
  },
  plugins: [
    // Add plugin for scrollbar hiding
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",

          /* Firefox */
          "scrollbar-width": "none",

          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
}

