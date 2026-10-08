import { definePlugin } from 'nitro';
import { expireStale } from '../services/swapService.js';
import { checkReminders } from '../services/reminderService.js';

export default definePlugin(() => {
  const tick = () => expireStale().then(checkReminders).catch(console.error);
  setTimeout(tick, 5000);
  setInterval(tick, 60000);
});
