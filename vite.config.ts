import { defineConfig } from 'vite';
// eslint-disable-next-line import/no-unresolved
import Unfonts from 'unplugin-fonts/vite'

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    Unfonts({
      custom: {
        display: 'auto',
        preload: true,
        injectTo: 'head',
        families: [
          {
            name: 'SF Pro Display',
            local: 'SF Pro Display',
            src: './src/assets/fonts/sfPro/sf-pro-display*',
          },
          {
            name: 'Signa',
            local: 'Signa',
            src: './src/assets/fonts/signa/signa*',
          },
        ],
      },
    })
  ]
});
