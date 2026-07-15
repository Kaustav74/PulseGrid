'use client';
import { useAppStore } from '@/lib/data/store';
import VitalsCard from '@/components/common/VitalsCard';
import { useState } from 'react';

export default function PatientPage() {
  const nodes = useAppStore((s) => s.nodes);
  const user = useAppStore((s) => s.user);
  const assignRescue = useAppStore((s) => s.assignRescue);

  const ownNodeId = user?.nodeId || (nodes.length > 0 ? nodes[0].id : null);
  const node = nodes.find((n) => n.id === ownNodeId);
  const [rescueStatus, setRescueStatus] = useState<'waiting' | 'assigned' | 'arrived'>('waiting');

  // No hardware at all
  if (nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl max-w-md text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-text-secondary">cell_tower</span>
          <h1 className="text-2xl font-bold text-accent-green font-mono glow-text">
            NO HARDWARE CONNECTED
          </h1>
          <p className="text-text-secondary mt-3">
            The system is waiting for a patient node to come online.
            Once a device is active, your vitals will appear here automatically.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse" />
            <span className="text-accent-red text-sm uppercase">Offline</span>
          </div>
        </div>
      </div>
    );
  }

  // Hardware online but this patient's node not found
  if (!node) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl max-w-md text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-accent-amber">search</span>
          <h1 className="text-2xl font-bold text-accent-amber font-mono">
            NODE NOT FOUND
          </h1>
          <p className="text-text-secondary mt-3">
            Your assigned node (ID: {ownNodeId}) is not currently transmitting.
            Please check that the device is powered on and within range.
          </p>
        </div>
      </div>
    );
  }

  // Live data
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-accent-green font-mono text-center glow-text">
        PATIENT DASHBOARD
      </h1>
      <VitalsCard node={node} />
      <div className="glass p-6 rounded-xl text-center">
        <p className="text-lg text-text-secondary mb-2">Rescue Status</p>
        <p
          className={`text-2xl font-bold ${
            rescueStatus === 'waiting'
              ? 'text-accent-amber'
              : rescueStatus === 'assigned'
              ? 'text-accent-green'
              : 'text-white'
          }`}
        >
          {rescueStatus === 'waiting' && <><span className="material-symbols-outlined align-middle mr-1 text-accent-amber">hourglass_empty</span> Waiting for Rescue</>}
          {rescueStatus === 'assigned' && <><span className="material-symbols-outlined align-middle mr-1 text-accent-green">emergency_share</span> Rescue Assigned</>}
          {rescueStatus === 'arrived' && <><span className="material-symbols-outlined align-middle mr-1 text-white">check_circle</span> Rescue Arrived</>}
        </p>
      </div>
      <button
        className="w-full bg-accent-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg active:scale-95 transition animate-pulse-red"
        onClick={() => {
          assignRescue(node.id);
          setRescueStatus('assigned');
          setTimeout(() => setRescueStatus('arrived'), 15000);
        }}
      >
        <span className="material-symbols-outlined align-middle mr-2 text-2xl">emergency</span> S.O.S.
      </button>
    </div>
  );
}