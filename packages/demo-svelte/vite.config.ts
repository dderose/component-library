import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    // Workspace packages use extensionless .ts imports which Node's native
    // ESM loader can't resolve. Tell Vite to bundle them during SSR.
    noExternal: ["@component-library/core", "@component-library/svelte"],
  },
});
