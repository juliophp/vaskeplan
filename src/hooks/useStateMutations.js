import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  cancelFn,
  requestSwapFn,
  respondFn,
  restartFn,
  testReminderFn,
  updatePersonFn,
} from '../functions/state.functions.js';
import { stateQueryOptions } from '../queries/state.js';

export function useStateMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: stateQueryOptions.queryKey });

  const updatePerson = useMutation({
    mutationFn: ({ id, patch }) => updatePersonFn({ data: { id, patch } }),
    onSuccess: invalidate,
  });
  const requestSwap = useMutation({
    mutationFn: ({ from, to }) => requestSwapFn({ data: { from, to } }),
    onSuccess: invalidate,
  });
  const respond = useMutation({
    mutationFn: ({ id, by, accept }) => respondFn({ data: { id, by, accept } }),
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: ({ id, by }) => cancelFn({ data: { id, by } }),
    onSuccess: invalidate,
  });
  const restart = useMutation({
    mutationFn: ({ first }) => restartFn({ data: { first } }),
    onSuccess: invalidate,
  });
  const testReminder = useMutation({
    mutationFn: () => testReminderFn(),
  });

  return { updatePerson, requestSwap, respond, cancel, restart, testReminder };
}
