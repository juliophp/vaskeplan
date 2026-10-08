import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import NavBar from '../components/NavBar.jsx';
import { stateQueryOptions } from '../queries/state.js';
import { useMe } from '../hooks/useMe.jsx';
import { requireAuthFn } from '../functions/auth.functions.js';

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    try {
      // Read the authenticated identity once. This avoids two back-to-back
      // session reads during navigation and keeps the login transition stable.
      const user = await requireAuthFn();

      if (user.role === 'admin') return;
      if (user.role === 'resident' && user.personId) return;

      throw redirect({ to: '/login' });
    } catch (error) {
      if (error && typeof error === 'object' && 'isRedirect' in error) throw error;
      throw redirect({ to: '/se' });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(stateQueryOptions),
  component: AppLayout,
});

function AppLayout() {
  useSuspenseQuery(stateQueryOptions);
  const { me, ready, isAdmin } = useMe();

  if (!ready) return <main><p className="s">Laster …</p></main>;

  // Rom velges én gang på login-siden. En autentisert beboer skal aldri
  // bli sendt til en ekstra onboarding/romvelger her.
  if (!me && !isAdmin) return <main><p className="s">Laster inn profilen din …</p></main>;

  return <><NavBar /><main><Outlet /></main></>;
}
