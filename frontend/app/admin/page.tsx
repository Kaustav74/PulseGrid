'use client';
import { useAppStore } from '@/lib/data/store';
import { useState } from 'react';
import { Role } from '@/types';

const roleOptions: { value: Role; label: string }[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'ambulance_driver', label: 'Ambulance Driver' },
  { value: 'hospital_staff', label: 'Hospital Staff' },
  { value: 'emergency', label: 'Emergency Doctor' },
  { value: 'admin', label: 'Administrator' },
];

export default function AdminPage() {
  const nodes = useAppStore((s) => s.nodes);
  const users = useAppStore((s) => s.users);
  const addUser = useAppStore((s) => s.addUser);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('emergency');
  const [nodeId, setNodeId] = useState('');

  const handleAddUser = () => {
    if (!name || !password) return;
    addUser({
      name,
      role,
      nodeId: nodeId ? parseInt(nodeId) : undefined,
      password,
    } as any);
    setName('');
    setPassword('');
    setNodeId('');
    setShowForm(false);
  };

  // No hardware fallback
  if (nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl max-w-md text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-text-secondary">lock</span>
          <h1 className="text-2xl font-bold text-accent-green font-mono">NO DEVICES REGISTERED</h1>
          <p className="text-text-secondary mt-3">System is waiting for patient nodes to connect. Once active, they will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-accent-green mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined">admin_panel_settings</span> ADMIN PORTAL
      </h1>

      {/* Node Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-accent-green">{nodes.length}</div>
          <div className="text-text-secondary text-sm">Active Nodes</div>
        </div>
      </div>

      {nodes.length > 0 && (
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-2">Node ID</th>
                <th className="p-2">HR</th>
                <th className="p-2">SpO₂</th>
                <th className="p-2">Battery</th>
                <th className="p-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <tr key={n.id} className="border-b border-gray-700">
                  <td className="p-2">{n.id}</td>
                  <td className="p-2">{n.hr}</td>
                  <td className="p-2">{n.spo2}%</td>
                  <td className="p-2">{n.battery}%</td>
                  <td className="p-2">({n.lat.toFixed(1)}, {n.lng.toFixed(1)})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Management */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-accent-green">USER MANAGEMENT</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent-green text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400 transition"
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <div className="glass p-4 rounded-xl mb-6 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-bg-tertiary border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-green"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg-tertiary border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-green"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-bg-tertiary border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-green"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Node ID (optional)"
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              className="bg-bg-tertiary border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-green"
            />
          </div>
          <button
            onClick={handleAddUser}
            className="mt-4 w-full bg-accent-green text-black font-bold py-2 rounded-lg hover:bg-green-400 transition"
          >
            Create User
          </button>
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-text-secondary text-sm">No users onboarded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Role</th>
                <th className="p-2">Node ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2 text-accent-green">{u.role}</td>
                  <td className="p-2">{u.nodeId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}