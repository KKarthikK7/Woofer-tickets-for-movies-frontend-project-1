import type { NextConfig } from "next";

// GitHub Pages serves the site from /<repo-name>/, so production builds need that prefix.
// `npm run dev` still runs at http://localhost:3000/
const basePath =
  process.env.NODE_ENV === "production" ? "/Woofer-tickets-for-movies-frontend-project-1" : "";

const nextConfig: NextConfig = {
  /* config options here */
  // build plain HTML/CSS/JS into the `out` folder (GitHub Pages can't run a Node server)
  output: "export",
  basePath,
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
