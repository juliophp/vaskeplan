import { definePlugin } from 'nitro';
import { useStorage } from 'nitro/storage';
import fsDriver from 'unstorage/drivers/fs';

// Data lagres som filer. I Azure App Service: sett DATA_DIR=/home/data (vedvarende disk).
// Vil du bruke Azure Blob/Table senere, bytt bare driveren her.
export default definePlugin(() => {
  useStorage().mount('data', fsDriver({ base: process.env.DATA_DIR || './.data' }));
});
