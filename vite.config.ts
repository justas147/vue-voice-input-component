import { defineConfig } from 'vite'
import { extname, relative, resolve } from 'path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import { glob } from 'glob'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    libInjectCss(),
    dts({ include: ['lib'] })
  ],
  build: {
    lib: {
      // src/indext.ts is where we have exported the component(s)
      entry: resolve(__dirname, "lib/index.ts"),
      name: "VueVoiceInputComponent",
      formats: ["es"],
      // the name of the output files when the build is run
      fileName: "vue-voice-input-component",
    },
    copyPublicDir: false,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["vue"],
      input: Object.fromEntries(
        glob.sync('lib/**/*.{ts,tsx}', {
          ignore: ["lib/**/*.d.ts"],
        }).map(file => [
          // The name of the entry point
          // lib/nested/foo.ts becomes nested/foo
          relative(
            'lib',
            file.slice(0, file.length - extname(file).length)
          ),
          // The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url))
        ])
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
        },
      },
    },
  },
})
