// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   // your existing config options here

//   eslint: {
//     // This disables ESLint errors from failing your production builds
//     ignoreDuringBuilds: true,
//   },
// };

// export default nextConfig;


// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
