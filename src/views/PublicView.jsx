import { useSuspenseQuery } from '@tanstack/react-query';
import { publicStateQueryOptions } from '../queries/state.js';
import Avatar from '../components/Avatar.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { CalendarCard } from './Kalender.jsx';
import { addWeeks, displayName, fmtWeekend, thisSaturday, whoAt } from '@shared/rota.js';

// Skrivebeskyttet visning for gjester (/se): hvem som vasker nå, kommende helger og månedskalender.
export default function PublicView() {
  const { data: s } = useSuspenseQuery(publicStateQueryOptions);
  const sat = thisSaturday(), now = whoAt(s, sat);

  return (
    <main className="public">
      <header className="pub-head">
        <div>
          <h1>🧽 Vaskeplan</h1>
          <p className="s">Kun visning</p>
        </div>
        <ThemeToggle />
      </header>

      <section className="card now hero">
        <Avatar person={now} size={72} />
        <div>
          <small>Vasker denne helgen · {fmtWeekend(sat)}</small>
          <div className="who"><b>{displayName(now)}</b><span className="room">Rom {now.id}</span></div>
        </div>
      </section>

      <section className="card">
        <h2>Kommende helger</h2>
        <ul className="list wk-list">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
            const d = addWeeks(sat, n), p = whoAt(s, d);
            return (
              <li key={n}>
                <Avatar person={p} size={40} />
                <div className="wk-main"><b>{displayName(p)}</b><span className="date">{fmtWeekend(d)}</span></div>
                <span className="room">Rom {p.id}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <CalendarCard state={s} className="card cal-card" title="Månedskalender" />
    </main>
  );
}
