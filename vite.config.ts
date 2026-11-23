import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // どのパスに置いても動くよう相対パスにする（GitHub Pages は /chu1-kimatsu/ の下）
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  // iPad実機の確認用に、cloudflared の一時トンネル（https://〜.trycloudflare.com）から見られるようにする
  preview: { allowedHosts: ['.trycloudflare.com'] },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: '中1 期末テスト演習',
        short_name: '期末演習',
        description: '中1 2学期期末テストの5教科演習アプリ',
        lang: 'ja',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        background_color: '#f3f6fb',
        theme_color: '#3a5bd9',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
});
