'use client';
import { useAppStore } from '@/lib/data/store';
import OSMMap from '@/components/common/OSMMap';
import VitalsCard from '@/components/common/VitalsCard';
import VitalsTimeline from '@/components/emergency/VitalsTimeline';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const Map = dynamic(() => import('@/components/common/OSMMap'), { ssr: false });

export default function EmergencyPage() {
  const nodes = useAppStore((s) => s.nodes);
  const selectedNode = useAppStore((s) => s.selectedNode);
  const selectNode = useAppStore((s) => s.selectNode);
  const triageCounts = useAppStore((s) => s.triageCounts);
  const assignRescue = useAppStore((s) => s.assignRescue);
  const rescueAnimation = useAppStore((s) => s.rescueAnimation);
  const vitalsHistory = useAppStore((s) => s.vitalsHistory);
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-center mt-20 text-text-secondary animate-pulse">Loading command center...</div>;

  if (nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl max-w-md text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-text-secondary">emergency</span>
          <h1 className="text-2xl font-bold text-accent-green font-mono">NO PATIENTS ONLINE</h1>
          <p className="text-text-secondary mt-3">Connect patient hardware to see live data, triage counts, and vital signs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 animate-fade-in">
      <div className="col-span-12 lg:col-span-6 glass rounded-xl p-2">
        {online ? (
          <Map nodes={nodes} onNodeClick={selectNode} selectedNode={selectedNode} rescueAnimation={rescueAnimation} />
        ) : (
          <div className="text-center text-text-secondary mt-20">Map offline</div>
        )}
      </div>
      <div className="col-span-12 lg:col-span-6 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(triageCounts).map(([key, count]) => (
            <div key={key} className={`glass rounded-xl p-3 text-center border ${key==='RED'?'border-accent-red animate-pulse-red':key==='YELLOW'?'border-accent-amber animate-pulse-yellow':key==='GREEN'?'border-accent-green animate-pulse-green':'border-gray-500'}`}>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs uppercase text-text-secondary">{key}</div>
            </div>
          ))}
        </div>
        {selectedNode && (
          <div className="glass p-4 rounded-xl">
            <VitalsCard node={nodes.find((n) => n.id === selectedNode)!} />
            <button onClick={() => assignRescue(selectedNode)} className="w-full mt-3 flex items-center justify-center gap-2 bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition">
              <span className="material-symbols-outlined">emergency_share</span> ASSIGN RESCUE
            </button>
            {vitalsHistory[selectedNode] && (
              <div className="mt-4">
                <h3 className="text-sm text-text-secondary mb-2">VITALS TIMELINE (60s)</h3>
                <VitalsTimeline data={vitalsHistory[selectedNode]} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}