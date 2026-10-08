import { dbRepository as repo } from '../repositories/dbRepository.js';
import { AppError } from '../utils/errors.js';
import { isLocked } from '../utils/clock.js';

const hasPerson = (db, id) => db.people.some((p) => p.id === id);

// Ventende forespørsler utløper når fristen (fredag 23:55) er passert.
export function expirePending(db, touch) {
  if (!isLocked()) return;
  for (const s of db.swaps) if (s.status === 'pending') { s.status = 'expired'; s.decided = Date.now(); touch(); }
}
export const expireStale = () => repo.update((db, touch) => expirePending(db, touch));

function findPending(db, id) {
  const s = db.swaps.find((x) => x.id === id);
  if (s?.status === 'expired') throw new AppError(410, 'Fristen gikk ut – forespørselen er utløpt');
  if (!s || s.status !== 'pending') throw new AppError(404, 'Forespørselen finnes ikke lenger');
  return s;
}

export const requestSwap = (from, to) =>
  repo.update((db, touch) => {
    expirePending(db, touch);
    if (!hasPerson(db, from) || !hasPerson(db, to) || from === to) throw new AppError(400, 'Ugyldig forespørsel');
    if (isLocked()) throw new AppError(403, 'Fristen (fredag kl. 23:55) er ute. Du kan be om bytte igjen fra mandag.');
    const dup = db.swaps.some((s) => s.status === 'pending' && ((s.from === from && s.to === to) || (s.from === to && s.to === from)));
    if (dup) throw new AppError(409, 'Det finnes allerede en ventende forespørsel mellom dere');
    db.swaps.push({ id: Date.now().toString(36), from, to, status: 'pending', created: Date.now() });
    db.swaps = db.swaps.slice(-40);
    touch();
  });

// Byttet skjer først her, når mottakeren godtar.
export const respond = (id, by, accept) =>
  repo.update((db, touch) => {
    expirePending(db, touch);
    const s = findPending(db, id);
    if (by !== s.to) throw new AppError(403, 'Bare mottakeren kan svare');
    if (accept) {
      const i = db.order.indexOf(s.from), j = db.order.indexOf(s.to);
      [db.order[i], db.order[j]] = [db.order[j], db.order[i]];
      s.status = 'accepted';
    } else s.status = 'declined';
    s.decided = Date.now();
    touch();
  });

export const cancel = (id, by) =>
  repo.update((db, touch) => {
    expirePending(db, touch);
    const s = findPending(db, id);
    if (by !== s.from) throw new AppError(403, 'Bare avsenderen kan trekke tilbake');
    s.status = 'cancelled'; s.decided = Date.now(); touch();
  });
