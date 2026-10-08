import { dbRepository as repo } from '../repositories/dbRepository.js';
import { AppError } from '../utils/errors.js';
import { isLocked, upcomingSaturday } from '../utils/clock.js';
import { ANCHOR } from '../../shared/rota.js';

// Valgt person vasker kommende helg, resten følger i samme rekkefølge som før.
export const restart = (first) =>
  repo.update((db, touch) => {
    const ok = (id) => db.people.some((p) => p.id === id);
    if (!ok(first)) throw new AppError(400, 'Ugyldig forespørsel');
    if (isLocked()) throw new AppError(403, 'Raden kan ikke startes på nytt fra fredag kl. 23:55 til mandag');
    const sat = upcomingSaturday();
    const w = Math.round((Date.UTC(sat.getFullYear(), sat.getMonth(), sat.getDate()) - ANCHOR) / 6048e5);
    const pos = ((w % 5) + 5) % 5, shift = (db.order.indexOf(first) - pos + 5) % 5;
    db.order = db.order.map((_, k) => db.order[(k + shift) % 5]);
    for (const s of db.swaps) if (s.status === 'pending') { s.status = 'expired'; s.decided = Date.now(); }
    touch();
  });
