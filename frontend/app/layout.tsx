'use client';
import './globals.css';
import TopBar from '@/components/dashboard/TopBar';
import ChatWidget from '@/components/chat/ChatWidget';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/data/store';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const token = useAppStore((s) => s.token);
  const connectWebSocket = useAppStore((s) => s.connectWebSocket);

  useEffect(() => {
    setMounted(true);
    if (token) connectWebSocket();
  }, [token]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background min-h-screen flex flex-col text-on-surface">
        {mounted ? (
          <>
            <TopBar />
            <main className="flex-1 p-4 overflow-auto">{children}</main>
            {token && <ChatWidget />}
          </>
        ) : (
          <header className="bg-surface-container-low border-b border-surface-container-highest px-6 py-3 shadow-lg">
            <span className="text-primary text-2xl font-mono font-bold">
              PULSE GRID OS
            </span>
          </header>
        )}
      </body>
    </html>
  );
}