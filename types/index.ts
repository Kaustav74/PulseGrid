export interface NodeData {
  id: number; hr: number; spo2: number; gForce: number;
  battery: number; flags: number; rssi: number; lat: number; lng: number; lastUpdate: number;
}
export type Role = 'patient'|'ambulance'|'hospital'|'emergency'|'admin';
export interface User { id: string; name: string; role: Role; nodeId?: number; }
export interface ChatMessage { role: 'user'|'assistant'; content: string; }
export interface VitalsHistory { time: number; hr: number; spo2: number; gForce: number; }
