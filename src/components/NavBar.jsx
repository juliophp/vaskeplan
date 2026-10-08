import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import Avatar from './Avatar.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { stateQueryOptions } from '../queries/state.js';
import { logoutFn } from '../functions/auth.functions.js';
import { useMe } from '../hooks/useMe.jsx';
import { displayName, person } from '@shared/rota.js';

export default function NavBar() {
  const { data: state } = useSuspenseQuery(stateQueryOptions);
  const { me, setMe, isAdmin } = useMe();
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = me ? state.swaps.filter((s) => s.status === 'pending' && s.to === +me).length : 0;
  const links = [['/', 'Hjem'], ['/kalender', 'Kalender'], ['/bytt', isAdmin ? 'Admin' : 'Bytt'], ['/beboere', 'Beboere']];
  const p = me ? person(state, me) : null;

  const logout = async () => {
    await logoutFn();
    setMe(null);
    try { localStorage.removeItem('vask.role'); } catch {}
    await navigate({ to: '/login' });
  };

  return (
    <header className="nav">
      <div className="nav-brand"><span className="nav-icon">🧽</span><strong>Vaskeplan</strong></div>
      <nav aria-label="Hovedmeny">
        {links.map(([to, label]) => (
          <Link key={to} to={to} className={location.pathname === to ? 'active' : ''}>
            {label}{to === '/bytt' && incoming > 0 && <span className="badge">{incoming}</span>}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        <ThemeToggle />
        <div className="me">
          {p && <><Avatar person={p} size={30} /><span className="me-name">{displayName(p)}</span></>}
          {isAdmin && <span className="role-badge">Admin</span>}
          {!isAdmin && <button className="ghost" onClick={() => setMe(null)}>Bytt bruker</button>}
          <button className="ghost logout" onClick={logout}>Logg ut</button>
        </div>
      </div>
    </header>
  );
}
