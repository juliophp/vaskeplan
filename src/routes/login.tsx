import { FormEvent, useEffect, useState } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { loginAdminFn, loginResidentFn, createResidentPasswordFn, currentUserFn } from '../functions/auth.functions.js';
import { getPublicStateFn } from '../functions/state.functions.js';

export const Route = createFileRoute('/login')({
  loader: async () => {
    const user = await currentUserFn();
    if (user) throw redirect({ to: '/' });
    return null;
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('resident');
  const [setup, setSetup] = useState(false);
  const [room, setRoom] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { data: state } = useQuery({ queryKey: ['public-state-login'], queryFn: getPublicStateFn, staleTime: 30000 });

  useEffect(() => { setPassword(''); setConfirm(''); setError(''); }, [mode, setup]);

  const login = useMutation({
    mutationFn: () => mode === 'admin'
      ? loginAdminFn({ data: { password } })
      : loginResidentFn({ data: { personId: room, password } }),
    onSuccess: (result) => {
      try { localStorage.setItem('vask.role', result?.role || mode); } catch {}
      navigate({ to: '/' });
    },
    onError: (err) => setError(err?.message || 'Kunne ikke logge inn.'),
  });

  const createPassword = useMutation({
    mutationFn: () => createResidentPasswordFn({ data: { personId: room, password } }),
    onSuccess: (result) => {
      try { localStorage.setItem('vask.role', result?.role || 'resident'); } catch {}
      navigate({ to: '/' });
    },
    onError: (err) => setError(err?.message || 'Kunne ikke opprette passord.'),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (setup) {
      if (password !== confirm) return setError('Passordene er ikke like.');
      createPassword.mutate();
    } else login.mutate();
  };

  const pending = login.isPending || createPassword.isPending;

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">🧽</div>
        <div className="auth-heading">
          <div><p className="eyebrow">VASKEPLAN</p><h1>{setup ? 'Opprett passord' : 'Logg inn'}</h1></div>
          <ThemeToggle />
        </div>

        {!setup && <div className="auth-tabs" role="tablist" aria-label="Innloggingstype">
          <button type="button" className={mode === 'resident' ? 'on' : ''} onClick={() => setMode('resident')}>Beboer</button>
          <button type="button" className={mode === 'admin' ? 'on' : ''} onClick={() => setMode('admin')}>Admin</button>
        </div>}

        <p className="s auth-intro">
          {setup ? 'Velg rommet ditt og lag et personlig passord. Passordet kan ikke opprettes på nytt hvis rommet allerede har et.' : mode === 'admin' ? 'Logg inn med admin-passordet for å administrere vaskeplanen.' : 'Logg inn med rommet ditt og passordet du har opprettet.'}
        </p>

        <form onSubmit={submit}>
          {mode === 'resident' && <>
            <label htmlFor="room">Rom</label>
            <select id="room" value={room} onChange={(e) => setRoom(e.target.value)} required>
              <option value="">Velg rom</option>
              {state?.people?.map((p) => <option key={p.id} value={p.id}>Rom {p.id}{p.name ? ` – ${p.name}` : ''}</option>)}
            </select>
          </>}
          <label htmlFor="password">{setup ? 'Nytt passord' : 'Passord'}</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minst 8 tegn" autoComplete={setup ? 'new-password' : 'current-password'} required />
          {setup && <><label htmlFor="confirm">Gjenta passord</label><input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Gjenta passordet" autoComplete="new-password" required /></>}
          {error && <p className="err auth-error" role="alert">{error}</p>}
          <button className="primary auth-submit" type="submit" disabled={pending || (mode === 'resident' && !room)}>{pending ? (setup ? 'Oppretter …' : 'Logger inn …') : (setup ? 'Opprett passord' : 'Logg inn')}</button>
        </form>

        <div className="auth-footer">
          {mode === 'resident' && !setup && <button className="link-button" type="button" onClick={() => setSetup(true)}>Jeg har ikke opprettet passord ennå</button>}
          {setup && <button className="link-button" type="button" onClick={() => setSetup(false)}>Tilbake til innlogging</button>}
          <a href="/se">← Se vaskeplanen uten innlogging</a>
        </div>
      </section>
    </main>
  );
}
