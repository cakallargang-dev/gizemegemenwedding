import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "static",
  publicDir: "./img",
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ]
});
