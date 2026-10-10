import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'chic_admin_session';
export const SESSION_HOURS = 12;

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be set (at least 32 characters)');
  return new TextEncoder().encode(secret);
}

export async function createSessionToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());
}

export async function isValidSession(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, key(), { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}
