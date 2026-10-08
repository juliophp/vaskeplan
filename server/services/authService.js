import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { useSession } from '@tanstack/react-start/server';
import { dbRepository as repo } from '../repositories/dbRepository.js';
import { AppError } from '../utils/errors.js';

const SESSION_NAME = 'vaskeplan-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const MIN_PASSWORD_LENGTH = 8;

function getSession() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new AppError(500, 'SESSION_SECRET må være satt og minst 32 tegn.');
  }

  return useSession({
    name: SESSION_NAME,
    password: secret,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    },
  });
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') };
}

function passwordMatches(password, record) {
  if (!record?.salt || !record?.hash) return false;
  const actual = scryptSync(password, record.salt, 64);
  const expected = Buffer.from(record.hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(400, `Passordet må være minst ${MIN_PASSWORD_LENGTH} tegn.`);
  }
}

export async function loginAdmin(password) {
  const configuredPassword = process.env.ADMIN_PASSWORD || process.env.APP_PASSWORD;
  if (!configuredPassword) throw new AppError(500, 'ADMIN_PASSWORD er ikke satt på serveren.');
  if (!password || password !== configuredPassword) throw new AppError(401, 'Feil admin-passord.');

  const session = await getSession();
  // Start a fresh session on privilege change so an old resident identity
  // can never leak into the admin session.
  await session.clear();
  // Admin har tilgang til appen uten å være knyttet til et bestemt rom.
  await session.update({ authenticated: true, role: 'admin', personId: null });
  return { ok: true, role: 'admin', personId: null };
}

export async function loginResident(personId, password) {
  const id = Number(personId);
  if (!Number.isInteger(id)) throw new AppError(400, 'Velg et gyldig rom.');
  if (!password) throw new AppError(401, 'Feil rom eller passord.');

  const db = await repo.read();
  const person = db.people.find((p) => p.id === id);
  const record = db.auth?.residents?.[String(id)];
  if (!person || !passwordMatches(password, record)) {
    throw new AppError(401, 'Feil rom eller passord.');
  }

  const session = await getSession();
  await session.clear();
  await session.update({ authenticated: true, role: 'resident', personId: id });
  return { ok: true, role: 'resident', personId: id };
}

export async function createResidentPassword(personId, password) {
  const id = Number(personId);
  if (!Number.isInteger(id)) throw new AppError(400, 'Velg et gyldig rom.');
  validatePassword(password);

  const result = await repo.update((db, touch) => {
    const person = db.people.find((p) => p.id === id);
    if (!person) throw new AppError(404, 'Fant ikke rommet.');
    db.auth = db.auth || { residents: {} };
    db.auth.residents = db.auth.residents || {};

    if (db.auth.residents[String(id)]) {
      throw new AppError(409, 'Dette rommet har allerede et passord. Kontakt admin hvis passordet må nullstilles.');
    }

    const { salt, hash } = hashPassword(password);
    db.auth.residents[String(id)] = { salt, hash };
    touch();
    return { ok: true };
  });

  const session = await getSession();
  await session.clear();
  await session.update({ authenticated: true, role: 'resident', personId: id });
  return { ...result, role: 'resident', personId: id };
}

export async function logout() {
  const session = await getSession();
  await session.clear();
  return { ok: true };
}

export async function getCurrentUser() {
  const session = await getSession();
  return session.data.authenticated
    ? { authenticated: true, role: session.data.role || null, personId: session.data.personId || null }
    : null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new AppError(401, 'Du må logge inn.');
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') throw new AppError(403, 'Bare admin kan utføre denne handlingen.');
  return user;
}
