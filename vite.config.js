import { defineConfig } from 'vite';
import del from 'rollup-plugin-delete'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    define: {
        DEV_MODE: false,
    },
    plugins: [
        del({ targets: 'dist/*', ignore: ['dist/assets'], runOnce: true}),
        del({ targets: 'dist/*', ignore: ['dist/assets', 'dist/index*'], runOnce: true, hook: 'buildEnd'}),
        viteStaticCopy({
            targets: [
                {
                    src: './lagged-sdk.conf.js',
                    dest: './',
                }
            ]
        }),
    ],
    server: {
        port: 8080,
    },
    build: {
        outDir: 'dist',
        assetsDir: '',
        minify: true,
        emptyOutDir: false,
        copyPublicDir: false,
        chunkSizeWarningLimit: 2 * 1024, // 2MB
    },
    publicDir: 'dist',
});
