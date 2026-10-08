import { dbRepository as repo } from '../repositories/dbRepository.js';
import { expirePending } from './swapService.js';
import { isLocked } from '../utils/clock.js';
import { getConfig } from '../utils/config.js';

export async function getState() {
  const db = await repo.update((d, touch) => { expirePending(d, touch); return d; });
  const { reminders, auth, ...rest } = db;
  const cfg = getConfig();
  return { ...rest, locked: isLocked(), notify: { whatsapp: cfg.waOn, webhook: !!cfg.hook, days: cfg.days, hour: cfg.hour } };
}

// Skrivebeskyttet utsnitt for gjester: ingen forespørsler, ingen varslingsoppsett.
export async function getPublic() {
  const { people, order } = await repo.read();
  return { people, order };
}
