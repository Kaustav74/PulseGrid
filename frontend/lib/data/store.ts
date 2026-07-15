import { create } from 'zustand';
import { NodeData, User, ChatMessage, Role } from '@/types';
import { getSession, getToken, createSession, destroySession } from '@/lib/auth/session';
import { getTriageCounts } from './triage';
import { v4 as uuid } from 'uuid';

interface AppState {
  user: User | null;
  token: string | null;
  nodes: NodeData[];
  selectedNode: number | null;
  triageCounts: Record<string, number>;
  wsStatus: 'online' | 'offline' | 'connecting';
  alerts: any[];
  chatHistory: ChatMessage[];
  chatbotOpen: boolean;
  rescueAnimation: number | null;
  users: User[];                         // locally stored users (loaded on client)

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  connectWebSocket: () => void;
  selectNode: (nodeId: number | null) => void;
  assignRescue: (nodeId: number) => void;
  allocateBed: (nodeId: number, bedNumber: number) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatbotOpen: (open: boolean) => void;
  startRescueAnimation: (nodeId: number) => void;
  addUser: (user: Omit<User, 'id'> & { password: string }) => void;
}

let ws: WebSocket | null = null;

export const useAppStore = create<AppState>((set, get) => ({
  user: getSession()?.user ?? null,
  token: getToken() ?? null,
  nodes: [],
  selectedNode: null,
  triageCounts: { GREEN: 0, YELLOW: 0, RED: 0, BLACK: 0 },
  wsStatus: 'offline',
  alerts: [],
  chatHistory: [],
  chatbotOpen: false,
  rescueAnimation: null,
  users: [],   // initially empty – loaded later on client

  // ----- Auth -----
  login: async (username, password) => {
    // 1) Check locally stored users (only on client)
    let localUsers: (User & { password: string })[] = [];
    if (typeof window !== 'undefined') {
      localUsers = JSON.parse(localStorage.getItem('pulsegrid_users') || '[]');
    }
    const foundLocal = localUsers.find(
      (u) => u.name === username && u.password === password
    );
    if (foundLocal) {
      const { password: _, ...userWithoutPwd } = foundLocal as any;
      createSession(userWithoutPwd, 'local-token');
      set({ user: userWithoutPwd, token: 'local-token' });
      get().connectWebSocket();
      return true;
    }

    // 2) Fallback to backend (if available)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        createSession(data.user, data.token);
        set({ user: data.user, token: data.token });
        get().connectWebSocket();
        return true;
      }
    } catch (e) {
      // Backend unavailable – use mock login for demo users (admin, etc.)
      if (password === 'admin123' && username === 'admin') {
        const adminUser: User = { id: 'admin', name: 'Admin', role: 'admin' };
        createSession(adminUser, 'local-token');
        set({ user: adminUser, token: 'local-token' });
        get().connectWebSocket();
        return true;
      }
      // Fallback – accept any for now (remove in production)
      const mockUser: User = {
        id: 'local',
        name: username,
        role: 'emergency',
        nodeId: 1,
      };
      if (username.includes('ambulance')) mockUser.role = 'ambulance_driver';
      else if (username.includes('hospital')) mockUser.role = 'hospital_staff';
      else if (username.includes('patient')) mockUser.role = 'patient';
      else if (username.includes('admin')) mockUser.role = 'admin';
      createSession(mockUser, 'local-token');
      set({ user: mockUser, token: 'local-token' });
      get().connectWebSocket();
      return true;
    }

    return false;
  },

  logout: () => {
    destroySession();
    if (ws) { ws.close(); ws = null; }
    set({ user: null, token: null, nodes: [], alerts: [], wsStatus: 'offline' });
  },

  // ----- WebSocket (real hardware) -----
  connectWebSocket: () => {
    if (typeof window === 'undefined') return;  // no WebSocket on server
    if (ws) {
      ws.onclose = null; // Prevent reconnect loop when explicitly replacing socket
      ws.close();
    }
    set({ wsStatus: 'connecting' });
    ws = new WebSocket(`ws://${window.location.hostname}:3001/ws?token=${getToken() || 'local-token'}`);

    ws.onopen = () => set({ wsStatus: 'online' });

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === 'telemetry_update' && Array.isArray(msg.nodes)) {
        const nodes: NodeData[] = msg.nodes.map((raw: any) => ({
          id: raw.id,
          hr: raw.hr ?? 0,
          spo2: raw.spo2 ?? 0,
          gForce: raw.gForce ?? 0,
          battery: raw.battery ?? 0,
          flags: raw.flags ?? 0,
          rssi: raw.rssi ?? 0,
          lat: raw.lat ?? 0,
          lng: raw.lng ?? 0,
          lastUpdate: Date.now(),
        }));
        set({
          nodes,
          triageCounts: getTriageCounts(nodes),
        });
      } else if (msg.type === 'rescue_assigned') {
        get().startRescueAnimation(msg.data.nodeId);
      }
    };

    ws.onerror = () => set({ wsStatus: 'offline' });
    ws.onclose = () => {
      set({ wsStatus: 'offline' });
      setTimeout(() => {
        if (get().token) get().connectWebSocket();
      }, 5000);
    };
  },

  selectNode: (nodeId) => set({ selectedNode: nodeId }),

  // ----- Rescue & Bed -----
  assignRescue: (nodeId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ cmd: 'ASSIGN_RESCUE', target: nodeId }));
    }
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          id: uuid(),
          nodeId,
          type: 'info',
          message: `Rescue assigned to Node ${nodeId}`,
          timestamp: Date.now(),
          acknowledged: false,
        },
      ],
    }));
  },

  allocateBed: (nodeId, bedNumber) => {
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          id: uuid(),
          nodeId,
          type: 'info',
          message: `Patient ${nodeId} assigned to bed ${bedNumber}`,
          timestamp: Date.now(),
          acknowledged: false,
        },
      ],
    }));
  },

  // ----- Chat -----
  addChatMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  setChatbotOpen: (open) => set({ chatbotOpen: open }),

  // ----- Animation -----
  startRescueAnimation: (nodeId) => {
    set({ rescueAnimation: nodeId });
    setTimeout(() => set({ rescueAnimation: null }), 2000);
  },

  // ----- Admin: add user (local storage) -----
  addUser: (userData) => {
    // This only runs on client, so localStorage is safe
    const newUser = {
      id: uuid(),
      name: userData.name,
      role: userData.role,
      nodeId: userData.nodeId,
      password: userData.password,   // plaintext for demo – not production!
    };
    let existing: any[] = [];
    if (typeof window !== 'undefined') {
      existing = JSON.parse(localStorage.getItem('pulsegrid_users') || '[]');
    }
    const updatedUsers = [...existing, newUser];
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsegrid_users', JSON.stringify(updatedUsers));
    }
    set({ users: updatedUsers });
  },
}));