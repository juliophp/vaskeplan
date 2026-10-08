import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import Avatar from '../components/Avatar.jsx';
import { stateQueryOptions } from '../queries/state.js';
import { useMe } from '../hooks/useMe.jsx';
import { addWeeks, addDays, displayName, fmt, nextTurn, person, thisSaturday, whoAt } from '@shared/rota.js';

export default function Home() {
  const { data: state } = useSuspenseQuery(stateQueryOptions);
  const { me, isAdmin } = useMe();
  const sat = thisSaturday();
  const now = whoAt(state, sat);
  const incoming = me ? state.swaps.filter((s) => s.status === 'pending' && s.to === me) : [];

  return <>
    <section className="card now"><Avatar person={now} size={84} /><div><small>Vasker denne helgen ({fmt(sat)}–{fmt(addDays(sat, 1))})</small><b>{displayName(now)}</b> <span className="room">Rom {now.id}</span></div></section>
    {isAdmin ? (
      <section className="card admin-home"><span className="admin-label">Admin</span><h2>Administrasjon</h2><p className="s">Du er logget inn som admin. Du trenger ikke velge et rom for å bruke appen.</p><Link className="primary admin-home-link" to="/bytt">Gå til adminfunksjoner →</Link></section>
    ) : <>
      {incoming.length > 0 && <section className="card alert"><Link to="/bytt">🔔 {incoming.length === 1 ? `${displayName(person(state, incoming[0].from))} vil bytte plass med deg` : `${incoming.length} byteforespørsler venter på svar`} →</Link></section>}
      <section className={'card' + (now.id === me ? ' hl' : '')}>{now.id === me ? <p className="big">🎉 Det er din tur denne helgen!</p> : <p>Din neste tur er <b>{fmt(nextTurn(state, me))}</b>.</p>}</section>
    </>}
    <section className="card"><h2>Kommende helger</h2><ul className="list">{[1,2,3,4].map((n) => { const d = addWeeks(sat,n), p=whoAt(state,d); return <li key={n}><span className="date">{fmt(d)}–{fmt(addDays(d,1))}</span><Avatar person={p} size={32}/><span>{displayName(p)}</span><span className="room">Rom {p.id}</span></li>; })}</ul></section>
  </>;
}
