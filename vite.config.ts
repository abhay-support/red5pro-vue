import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'red5pro-webrtc-sdk': 'red5pro-webrtc-sdk/red5pro-sdk.esm.min.js',
    },
  },
})
