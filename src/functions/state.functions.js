import { createServerFn } from '@tanstack/react-start';
import { getState, getPublic } from '../../server/services/stateService.js';
import { updatePerson } from '../../server/services/peopleService.js';
import { requestSwap, respond, cancel } from '../../server/services/swapService.js';
import { restart } from '../../server/services/rotaService.js';
import { sendTest } from '../../server/services/reminderService.js';
import { requireAuth, requireAdmin } from '../../server/services/authService.js';

const passthrough = (data) => data;

export const getStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireAuth();
  return getState();
});

export const getPublicStateFn = createServerFn({ method: 'GET' }).handler(() => getPublic());

export const updatePersonFn = createServerFn({ method: 'POST' })
  .inputValidator(passthrough)
  .handler(async ({ data }) => {
    await requireAuth();
    return updatePerson(+data.id, data.patch || {});
  });

export const requestSwapFn = createServerFn({ method: 'POST' })
  .inputValidator(passthrough)
  .handler(async ({ data }) => {
    await requireAuth();
    await requestSwap(+data.from, +data.to);
    return { ok: true };
  });

export const respondFn = createServerFn({ method: 'POST' })
  .inputValidator(passthrough)
  .handler(async ({ data }) => {
    await requireAuth();
    await respond(String(data.id), +data.by, !!data.accept);
    return { ok: true };
  });

export const cancelFn = createServerFn({ method: 'POST' })
  .inputValidator(passthrough)
  .handler(async ({ data }) => {
    await requireAuth();
    await cancel(String(data.id), +data.by);
    return { ok: true };
  });

export const restartFn = createServerFn({ method: 'POST' })
  .inputValidator(passthrough)
  .handler(async ({ data }) => {
    await requireAdmin();
    await restart(+data.first);
    return { ok: true };
  });

export const testReminderFn = createServerFn({ method: 'POST' }).handler(async () => {
  await requireAuth();
  return sendTest();
});
