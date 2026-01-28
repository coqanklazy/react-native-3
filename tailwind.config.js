/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#DC2626",
          secondary: "#F87171",
          cta: "#CA8A04",
          bg: "#FEF2F2",
          text: "#450A0A",
        },
      },
      fontFamily: {
        display: ["PlayfairDisplaySC_700Bold"],
        body: ["Karla_400Regular"],
        bodyBold: ["Karla_600SemiBold"],
      },
    },
  },
  plugins: [],
}
