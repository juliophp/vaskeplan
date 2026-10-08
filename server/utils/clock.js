import { addDays } from '../../shared/rota.js';

export function oslo() {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const o = Object.fromEntries(f.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { date: new Date(+o.year, +o.month - 1, +o.day), wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), mins: +o.hour * 60 + +o.minute };
}
// Frist: fredag 23:55. Låst til og med søndag, åpent igjen fra mandag.
export function isLocked() {
  const n = oslo();
  return (n.wd === 5 && n.mins >= 23 * 60 + 55) || n.wd === 6 || n.wd === 0;
}
export function upcomingSaturday() {
  const n = oslo();
  return addDays(n.date, (6 - n.wd + 7) % 7);
}
