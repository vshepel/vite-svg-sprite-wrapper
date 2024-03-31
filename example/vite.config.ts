import { defineConfig } from 'vite'
import ViteSvgSpriteWrapper from 'vite-svg-sprite-wrapper'

export default defineConfig({
  plugins: [
    ViteSvgSpriteWrapper({
      icons: 'svg/*.svg',
      outputDir: './public',
    }),
  ],
  build: {
    copyPublicDir: false,
    manifest: true,
  },
})
