import { dbRepository as repo } from '../repositories/dbRepository.js';
import { sendAll } from '../integrations/notifier.js';
import { AppError } from '../utils/errors.js';
import { getConfig } from '../utils/config.js';
import { oslo, upcomingSaturday } from '../utils/clock.js';
import { addDays, displayName, fmt, iso, whoAt } from '../../shared/rota.js';

function reminderText(db, sat, n) {
  const cfg = getConfig(), p = whoAt(db, sat);
  const when = n === 1 ? 'I morgen' : `Om ${n} dager`;
  return `🧽 ${when} (${fmt(sat)}–${fmt(addDays(sat, 1))}) er det ${displayName(p)} (Rom ${p.id}) sin tur til å vaske.\nVil du bytte? Be om det i appen innen fredag kl. 23:55.${cfg.appUrl ? '\n' + cfg.appUrl : ''}`;
}

// Kjøres hvert minutt. Hver påminnelse (helg + antall dager før) sendes bare én gang.
export async function checkReminders() {
  const cfg = getConfig();
  if (!cfg.waOn && !cfg.hook) return;
  const n = oslo(), sat = upcomingSaturday();
  for (const d of cfg.days) {
    if (iso(addDays(sat, -d)) !== iso(n.date) || n.mins < cfg.hour * 60) continue;
    const key = `${iso(sat)}:${d}`;
    const text = await repo.update((db, touch) => {
      if (db.reminders[key]) return null;
      db.reminders[key] = Date.now(); touch();
      return reminderText(db, sat, d);
    });
    if (!text) continue;
    const r = await sendAll(text);
    if (!r.sent.length) { // prøv igjen neste minutt
      await repo.update((db, touch) => { delete db.reminders[key]; touch(); });
      console.error('Påminnelse feilet:', r.errors.join('; '));
    }
  }
}

export async function sendTest() {
  const cfg = getConfig();
  if (!cfg.waOn && !cfg.hook) throw new AppError(400, 'Ingen varslingskanal er satt opp på serveren (se README)');
  const db = await repo.read();
  const r = await sendAll('🧽 Test fra Vaskeplan\n' + reminderText(db, upcomingSaturday(), cfg.days[0] || 1));
  if (!r.sent.length) throw new AppError(502, r.errors.join('; '));
  return r;
}
