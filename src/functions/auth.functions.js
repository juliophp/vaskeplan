import { createServerFn } from '@tanstack/react-start';
import {
  loginAdmin,
  loginResident,
  createResidentPassword,
  logout,
  getCurrentUser,
  requireAuth,
} from '../../server/services/authService.js';

const passthrough = (data) => data;

export const loginAdminFn = createServerFn({ method: 'POST' })
  .inputValidator(passthrough)
  .handler(({ data }) => loginAdmin(String(data.password || '')));

export const loginResidentFn = createServerFn({ method: 'POST' })
  .inputValidator(passthrough)
  .handler(({ data }) => loginResident(Number(data.personId), String(data.password || '')));

export const createResidentPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(passthrough)
  .handler(({ data }) => createResidentPassword(Number(data.personId), String(data.password || '')));

export const logoutFn = createServerFn({ method: 'POST' }).handler(() => logout());
export const currentUserFn = createServerFn({ method: 'GET' }).handler(() => getCurrentUser());
export const requireAuthFn = createServerFn({ method: 'GET' }).handler(() => requireAuth());
