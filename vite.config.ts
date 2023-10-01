import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      manifest: {
        name: "Commune",
        short_name: "Commune",
        background_color: "#fff",
        theme_color: "#000",
        start_url: "/",
        display: "standalone",
        prefer_related_applications: true,
        icons: [
          {
            src: "/maskable_icon_x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/maskable_icon_x192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "any",
          },
          {
            src: "/maskable_icon_x512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
      },
    }),
  ],
  server: {
    fs: {
      allow: [".."],
    },
  },
  build: {
    minify: "esbuild",
    cssMinify: true,
    sourcemap: true,
  },
});
