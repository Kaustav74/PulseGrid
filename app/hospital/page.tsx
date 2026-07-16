'use client';
import { useAppStore } from '@/lib/data/store';
import OSMMap from '@/components/common/OSMMap';
import { getTriageColor } from '@/lib/data/triage';
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from 'react';
import L from 'leaflet';

const Map = dynamic(() => import('@/components/common/OSMMap'), { ssr: false });

export default function HospitalPage() {
  const nodes = useAppStore((s) => s.nodes);
  const triageCounts = useAppStore((s) => s.triageCounts);
  const allocateBedAction = useAppStore((s) => s.allocateBed);
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  const hospitalLat = 12.934;
  const hospitalLng = 77.605;

  const beds = { total: 50, occupied: nodes.length, available: 50 - nodes.length };
  const [assignedPatients, setAssignedPatients] = useState<Set<number>>(new Set());

  const assignBed = (nodeId: number) => {
    if (assignedPatients.has(nodeId)) return;
    allocateBedAction(nodeId, Math.floor(Math.random() * 50) + 1);
    setAssignedPatients(new Set(assignedPatients).add(nodeId));
  };

  useEffect(() => {
    setOnline(navigator.onLine);
    setMounted(true);
  }, []);

  const sortedPatients = useMemo(() => {
    const order: Record<string, number> = { red: 0, yellow: 1, green: 2, black: 3 };
    return [...nodes].sort((a, b) => order[getTriageColor(a)] - order[getTriageColor(b)]);
  }, [nodes]);

  if (!mounted) return <div className="text-center mt-20 text-text-secondary animate-pulse">Loading...</div>;

  const hospitalIcon = L.divIcon({ html: '<div class="material-symbols-outlined" style="font-size:28px; color: #00ff41;">local_hospital</div>', iconSize: [35,35], iconAnchor: [17,17] });

  return (
    <div className="grid grid-cols-12 gap-4 animate-fade-in">
      <div className="col-span-12 lg:col-span-8 glass rounded-xl p-2">
        {online ? (
          <Map
            nodes={nodes}
            onNodeClick={() => {}}
            selectedNode={null}
            extraMarkers={[{ key: 'hospital', position: [hospitalLat, hospitalLng], icon: hospitalIcon, popupContent: '<span class="material-symbols-outlined align-middle text-sm">local_hospital</span> City General Hospital' }]}
          />
        ) : (
          <div className="text-center text-text-secondary mt-20">Map offline</div>
        )}
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-4">
        {nodes.length === 0 ? (
          <div className="glass p-8 rounded-xl text-center">
            <span className="material-symbols-outlined text-6xl mb-4 text-text-secondary">local_hospital</span>
            <h1 className="text-xl font-bold text-accent-green">NO PATIENTS CONNECTED</h1>
            <p className="text-text-secondary mt-3">Real-time patient data will appear once hardware nodes are online.</p>
          </div>
        ) : (
          <>
            <div className="glass p-4 rounded-xl">
              <h2 className="text-accent-green text-lg font-bold mb-3">TRIAGE SUMMARY</h2>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(triageCounts).map(([key, count]) => (
                  <div key={key} className={`glass rounded-xl p-3 text-center border ${key==='RED'?'border-accent-red animate-pulse-red':key==='YELLOW'?'border-accent-amber animate-pulse-yellow':key==='GREEN'?'border-accent-green animate-pulse-green':'border-gray-500'}`}>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs uppercase text-text-secondary">{key}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-4 rounded-xl">
              <h2 className="text-accent-green text-lg font-bold mb-3">BED ALLOCATION</h2>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary">Total: {beds.total}</span>
                <span className="text-text-secondary">Occupied: {beds.occupied}</span>
                <span className="text-accent-green font-bold">Available: {beds.available}</span>
              </div>
              <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                <div className="bg-accent-green h-3 rounded-full" style={{ width: `${(beds.occupied/beds.total)*100}%` }} />
              </div>
            </div>

            <div className="glass p-4 rounded-xl">
              <h2 className="text-accent-green text-lg font-bold mb-3">RESOURCES</h2>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-text-secondary">Ventilators</span><span className="text-white">15/20</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Oxygen</span><span className="text-white">85%</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Staff on duty</span><span className="text-white">12</span></div>
              </div>
            </div>

            <div className="glass p-4 rounded-xl">
              <h2 className="text-accent-green text-lg font-bold mb-3">PATIENT QUEUE</h2>
              <div className="max-h-64 overflow-y-auto">
                {sortedPatients.map(patient => {
                  const color = getTriageColor(patient);
                  const assigned = assignedPatients.has(patient.id);
                  return (
                    <div key={patient.id} className="flex items-center justify-between bg-bg-tertiary/50 p-2 rounded mb-1">
                      <div>
                        <span className={`text-xs uppercase font-bold ${color==='red'?'text-accent-red':color==='yellow'?'text-accent-amber':'text-accent-green'}`}>{color}</span>
                        <span className="text-white text-sm ml-2">Node {patient.id}</span>
                        <span className="text-text-secondary text-xs ml-2">HR: {patient.hr} | SpO2: {patient.spo2}%</span>
                      </div>
                      <button onClick={() => assignBed(patient.id)} disabled={assigned} className="text-xs bg-accent-green text-black px-2 py-1 rounded hover:bg-green-400 transition disabled:opacity-50">
                        {assigned ? 'Assigned' : 'Assign Bed'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}