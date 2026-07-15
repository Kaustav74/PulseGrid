'use client';
import { useAppStore } from '@/lib/data/store';
import OSMMap from '@/components/common/OSMMap';
import VitalsCard from '@/components/common/VitalsCard';
import { getTriageColor } from '@/lib/data/triage';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const OSMMapDynamic = dynamic(() => import('@/components/common/OSMMap'), { ssr: false });

export default function AmbulancePage() {
  const nodes = useAppStore((s) => s.nodes);
  const selectedNode = useAppStore((s) => s.selectedNode);
  const selectNode = useAppStore((s) => s.selectNode);
  const rescueAnimation = useAppStore((s) => s.rescueAnimation);
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="text-center mt-20 text-text-secondary animate-pulse">Loading map...</div>;
  }

  // No hardware
  if (nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl max-w-md text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-text-secondary">emergency_share</span>
          <h1 className="text-2xl font-bold text-accent-green font-mono">WAITING FOR PATIENTS</h1>
          <p className="text-text-secondary mt-3">No patient nodes are currently active. Data will appear once devices come online.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-full animate-fade-in">
      <div className="col-span-12 lg:col-span-8 glass rounded-xl p-2">
        {online ? (
          <OSMMapDynamic nodes={nodes} onNodeClick={selectNode} selectedNode={selectedNode} rescueAnimation={rescueAnimation} />
        ) : (
          <div className="text-center text-text-secondary mt-20">Map offline</div>
        )}
      </div>
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <div className="glass p-4 rounded-xl">
          <h2 className="text-accent-green text-xl font-bold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">directions_car</span> AMBULANCE
          </h2>
          <p className="text-text-secondary">Total Patients: {nodes.length}</p>
        </div>
        {nodes.filter((n) => getTriageColor(n) === 'red').map((node) => (
          <VitalsCard key={node.id} node={node} onClick={() => selectNode(node.id)} />
        ))}
        {nodes.filter((n) => getTriageColor(n) === 'red').length === 0 && (
          <div className="glass p-4 rounded-xl text-center text-text-secondary">No critical patients</div>
        )}
      </div>
    </div>
  );
}