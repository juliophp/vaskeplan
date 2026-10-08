import { createContext, useContext, useEffect, useState } from 'react';
import { currentUserFn } from '../functions/auth.functions.js';

const MeContext = createContext(null);

export function MeProvider({ children }) {
  const [me, setMeState] = useState(null);
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem('vask.role') || null; } catch { return null; }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    currentUserFn()
      .then((user) => {
        if (!active) return;

        // The server session is authoritative.  A valid admin session never
        // has a personId, so it must not fall through to resident onboarding.
        if (user?.role === 'admin') {
          setRole('admin');
          setMeState(null);
          try {
            localStorage.setItem('vask.role', 'admin');
            localStorage.removeItem('vask.me');
          } catch {}
          return;
        }

        // Only switch to resident mode when the server gives us a complete
        // resident identity. This prevents a transient/incomplete session
        // response after admin login from turning the UI into a room picker.
        if (user?.role === 'resident' && user.personId) {
          const id = Number(user.personId);
          setRole('resident');
          setMeState(id);
          try {
            localStorage.setItem('vask.role', 'resident');
            localStorage.setItem('vask.me', String(id));
          } catch {}
          return;
        }

        // If there is no authenticated user, clear stale client identity.
        setRole(null);
        setMeState(null);
        try {
          localStorage.removeItem('vask.role');
          localStorage.removeItem('vask.me');
        } catch {}
      })
      .catch(() => {
        // Keep the role from the successful login while the client session
        // is settling. Server-side authorization still remains authoritative.
      })
      .finally(() => active && setReady(true));

    return () => { active = false; };
  }, []);

  const setMe = (id) => {
    try {
      if (id) localStorage.setItem('vask.me', String(id));
      else localStorage.removeItem('vask.me');
    } catch {}
    setMeState(id || null);
  };

  return <MeContext.Provider value={{ me, setMe, role, isAdmin: role === 'admin', ready }}>{children}</MeContext.Provider>;
}

export function useMe() {
  const value = useContext(MeContext);
  if (!value) throw new Error('useMe must be used inside MeProvider');
  return value;
}
