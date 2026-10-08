import { createFileRoute } from '@tanstack/react-router';
import PublicView from '../views/PublicView.jsx';
import { publicStateQueryOptions } from '../queries/state.js';

export const Route = createFileRoute('/se')({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicStateQueryOptions),
  component: PublicView,
});
