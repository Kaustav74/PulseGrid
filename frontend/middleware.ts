import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleRoutes: Record<string, string[]> = {
  patient: ['/patient'],
  ambulance: ['/ambulance'],
  ambulance_driver: ['/ambulance'],        // ← allow backend role name
  hospital: ['/hospital'],
  hospital_staff: ['/hospital'],           // ← allow backend role name
  emergency: ['/emergency', '/patient', '/ambulance', '/hospital'],
  admin: ['/admin', '/emergency', '/patient', '/ambulance', '/hospital'],
};

export function middleware(request: NextRequest) {
  const session = request.cookies.get('pulsegrid_session');
  const pathname = request.nextUrl.pathname;

  if (
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const data = JSON.parse(session.value);
    const allowed = roleRoutes[data.user.role] || [];
    if (!allowed.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL(allowed[0] || '/login', request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};