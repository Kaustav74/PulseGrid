'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/data/store';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const nodeCount = useAppStore((s) => s.nodes.length);
  const wsStatus = useAppStore((s) => s.wsStatus);
  const user = useAppStore((s) => s.user);
  const token = useAppStore((s) => s.token);
  const logout = useAppStore((s) => s.logout);
  const router = useRouter();
  const [time, setTime] = useState('--:--:-- --');

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const isLoggedIn = !!token && !!user;

  return (
    <header className="glass border-b border-green-900/30 px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 shadow-lg">
      {/* Left section */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto text-center md:text-left">
        <div className="flex items-center justify-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_10px_rgba(244,190,85,0.4)]" />
          <span className="text-accent-green text-xl md:text-2xl font-mono font-bold tracking-wider glow-text relative">
            PULSE GRID OS
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent-green/50 blur-sm" />
          </span>
        </div>

        {isLoggedIn && (
          <>
            <span className="hidden md:inline text-text-secondary/30 text-2xl font-thin">|</span>
            <div className="flex items-center gap-4 justify-center">
              <div className="flex items-center gap-2 bg-bg-tertiary/40 px-3 py-1 rounded-full border border-gray-700/30">
                <span className="text-text-secondary text-xs">NODES</span>
                <span className="font-mono text-accent-green font-bold">{nodeCount}</span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    wsStatus === 'online' ? 'bg-accent-green animate-pulse' : 'bg-accent-red'
                  }`}
                />
                <span
                  className={`text-xs uppercase tracking-widest ${
                    wsStatus === 'online' ? 'text-accent-green' : 'text-accent-red'
                  }`}
                >
                  {wsStatus === 'online' ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center justify-center gap-3 md:gap-5 w-full md:w-auto">
        <div className="bg-bg-tertiary/40 px-3 py-1 rounded-md border border-gray-700/30 hidden sm:block">
          <span className="text-text-secondary font-mono text-sm tracking-widest">{time}</span>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-3 bg-bg-tertiary/40 md:bg-transparent px-4 py-2 md:p-0 rounded-lg md:rounded-none w-full md:w-auto justify-between md:justify-end">
            <span className="text-sm text-text-secondary">
              {user?.name} <span className="text-accent-green">({user?.role})</span>
            </span>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="text-xs text-accent-red hover:text-red-400 transition-colors border border-accent-red/20 px-2 py-0.5 rounded"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-accent-green hover:underline"
          >
            LOGIN
          </button>
        )}
      </div>
    </header>
  );
}