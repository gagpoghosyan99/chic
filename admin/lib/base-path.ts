// Set at build time (BASE_PATH, e.g. "/admin" on chic.ngo). Next.js adds it to <Link>, router and
// redirect() URLs itself; plain URLs (fetch, <a>, <img>, cookie paths) need it added by hand.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const withBasePath = (path: string) => `${BASE_PATH}${path}`;

export const COOKIE_PATH = BASE_PATH || '/';
