import { queryOptions } from '@tanstack/react-query';
import { getStateFn, getPublicStateFn } from '../functions/state.functions.js';

// State oppdateres automatisk slik at flere beboere/admin kan bruke appen samtidig
// uten å måtte laste siden på nytt.
export const stateQueryOptions = queryOptions({
  queryKey: ['state'],
  queryFn: () => getStateFn(),
  staleTime: 1000,
  refetchInterval: 2000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
});

export const publicStateQueryOptions = queryOptions({
  queryKey: ['public-state'],
  queryFn: () => getPublicStateFn(),
  staleTime: 1000,
  refetchInterval: 3000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
});
