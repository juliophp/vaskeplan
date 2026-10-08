import { defineConfig } from 'nitro';

// Lagringen ("data") monteres ved oppstart i server/plugins/01.storage.js,
// slik at DATA_DIR leses når serveren kjører – ikke når den bygges.
export default defineConfig({
  serverDir: './server',
  preset: 'node-server',
  compatibilityDate: '2025-01-01',
});
