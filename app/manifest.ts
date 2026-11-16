import type { MetadataRoute } from "next";

// Web app manifest (served at /manifest.webmanifest). Icons are made from the logo mark.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Radiant Educations",
    short_name: "Radiant",
    description: "Colleges, courses, entrance exams, scholarships and internships for students across India.",
    start_url: "/",
    display: "standalone",
    theme_color: "#0f766e",
    background_color: "#fcfaf6",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/brand/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/brand/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/brand/icon-maskable-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
