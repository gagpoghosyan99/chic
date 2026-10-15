import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, isValidSession } from './lib/session';

export async function middleware(request: NextRequest) {
  if (await isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const login = request.nextUrl.clone();
  login.pathname = '/login';
  login.search = '';
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico|logo.png).*)'],
};
