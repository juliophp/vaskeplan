export const ANCHOR = Date.UTC(2026, 0, 3); // en fast lørdag som startpunkt
const COLORS = ['#d97757', '#6a9bcc', '#788c5d', '#b0805a', '#8b6fb0'];

export const person = (s, id) => s.people.find((p) => p.id === id);
export const displayName = (p) => p.name || `Rom ${p.id}`;
export const avatarSrc = (p) =>
  p.photo ||
  'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${COLORS[(p.id - 1) % 5]}"/><text x="32" y="42" font-size="28" font-family="sans-serif" fill="#fff" text-anchor="middle">${(p.name || String(p.id))[0].toUpperCase().replace(/[<>&"]/g, '?')}</text></svg>`
    );

export function whoAt(s, d) {
  const w = Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - ANCHOR) / 6048e5);
  return person(s, s.order[((w % 5) + 5) % 5]);
}
// Dagens dato i Oslo (samme resultat på server og klient, uavhengig av tidssone).
function osloToday() {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-').map(Number);
  return new Date(y, m - 1, d);
}
// Helgen varer lørdag og søndag: på en søndag er "denne helgen" den forrige lørdagen.
export function thisSaturday() {
  const d = osloToday();
  const k = d.getDay();
  d.setDate(d.getDate() + (k === 0 ? -1 : 6 - k));
  return d;
}
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addWeeks = (d, n) => addDays(d, 7 * n);
export const fmt = (d) => d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' });
// Kompakt helgedato: «10.–11. okt.» eller «31. okt.–1. nov.»
export function fmtWeekend(sat) {
  const sun = addDays(sat, 1), mon = (x) => x.toLocaleDateString('nb-NO', { month: 'short' });
  return sat.getMonth() === sun.getMonth()
    ? `${sat.getDate()}.–${sun.getDate()}. ${mon(sat)}`
    : `${sat.getDate()}. ${mon(sat)}–${sun.getDate()}. ${mon(sun)}`;
}
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function nextTurn(s, id) {
  const t = thisSaturday();
  for (let i = 0; i < 5; i++) if (whoAt(s, addWeeks(t, i)).id === id) return addWeeks(t, i);
}
