// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//    darkMode: "class",
//   content: ["./index.html", "./src/**/*.{js,jsx}"],
//   theme: {
//     extend: {
//       colors: {
//         primary: "#2563eb",
//         "primary-light": "#dbeafe",
//         "background-light": "#f8fafc",
//         "background-dark": "#0f172a",
//       },
//       fontFamily: {
//         display: ["Lexend", "sans-serif"],
//       },
//       borderRadius: {
//         DEFAULT: "0.25rem",
//         lg: "0.5rem",
//         xl: "0.75rem",
//         "2xl": "1rem",
//         full: "9999px",
//       },
//     },
//   },
//   plugins: [
//     react(),
//   tailwindcss()],
  
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});

