import Cookies from 'js-cookie';
import { User } from '@/types';

export function createSession(user: User, token: string) {
  Cookies.set('pulsegrid_session', JSON.stringify({ user, expiresAt: Date.now() + 24*60*60*1000 }), { expires: 1 });
  Cookies.set('pulsegrid_token', token, { expires: 1 });
}
export function getSession() {
  const raw = Cookies.get('pulsegrid_session');
  if (!raw) return null;
  try { const s = JSON.parse(raw); if (s.expiresAt < Date.now()) { destroySession(); return null; } return s; } catch { return null; }
}
export function getToken() { return Cookies.get('pulsegrid_token'); }
export function destroySession() { Cookies.remove('pulsegrid_session'); Cookies.remove('pulsegrid_token'); }
