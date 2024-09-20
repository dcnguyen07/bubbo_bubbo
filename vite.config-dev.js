import { defineConfig } from "vite";
import del from "rollup-plugin-delete";
import { viteStaticCopy } from "vite-plugin-static-copy";
import VitePluginRestart from 'vite-plugin-restart';

export default defineConfig({
  define: {
    DEV_MODE: true,
  },
  plugins: [
    del({ targets: "dist/*", ignore: ["dist/assets"], runOnce: true }),
    del({ targets: "dist/*", ignore: ["dist/assets", "dist/index*"], runOnce: true, hook: "buildEnd" }),
    viteStaticCopy({
      targets: [
        {
          src  : "./lagged-sdk.conf.js",
          dest : "./",
        },
      ],
    }),
      VitePluginRestart({
        restart: [
          'src/**/*'
        ],
      })
  ],
  server: {
    port  : 8080,
    watch : {
      usePolling: true,
    },
  },
  build: {
    outDir                : "public",
    assetsDir             : "",
    minify                : false,
    emptyOutDir           : false,
    copyPublicDir         : false,
    chunkSizeWarningLimit : 2 * 1024, // 2MB
  },
  publicDir: "public",
});
