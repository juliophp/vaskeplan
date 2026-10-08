import { useSuspenseQuery } from '@tanstack/react-query';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { stateQueryOptions } from '../queries/state.js';
import { useMe } from '../hooks/useMe.jsx';

export default function Onboarding() {
  const { data: state } = useSuspenseQuery(stateQueryOptions);
  const { me, setMe, isAdmin } = useMe();
  if (me) return null;

  return (
    <section className="card narrow">
      <div className="row"><h1>{isAdmin ? 'Velg beboer' : 'Velkommen!'}</h1><ThemeToggle /></div>
      <p className="s">{isAdmin ? 'Velg hvem du vil se vaskeplanen som. Admin-funksjonene er fortsatt tilgjengelige.' : 'Velg rommet ditt for å fortsette.'}</p>
      <div className="rooms">
        {state.people.map((p) => (
          <button key={p.id} className="room-btn" onClick={() => setMe(p.id)}>
            Rom {p.id}{p.name && <small>{p.name}</small>}
          </button>
        ))}
      </div>
    </section>
  );
}
