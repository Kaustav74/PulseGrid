import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { AuthService } from '../auth/AuthService';
import { NodeModel } from '../../models';

const HUB_WS_URL = process.env.HUB_WS_URL || 'ws://192.168.4.1:81';

export class WebSocketService {
  private wss: WebSocketServer;
  private clients = new Map<number, WebSocket>();   // dashboard clients
  private hubSocket: WebSocket | null = null;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setup();

    // Connect to real Gateway Hub only if enabled
    if (process.env.CONNECT_TO_HUB === 'true') {
      this.connectToHub();
    } else {
      console.log('ℹ️ Hardware Hub connection disabled (set CONNECT_TO_HUB=true to enable)');
    }
  }

  private setup() {
    // ── Accept dashboard connections ────────────────────────
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url || '', 'http://localhost');
      const token = url.searchParams.get('token');
      if (!token) { ws.close(); return; }
      const user = AuthService.getUserFromToken(token);
      if (!user) { ws.close(); return; }

      this.clients.set(user.id, ws);
      console.log(`Dashboard client connected (user ${user.id})`);

      // Send current state (empty until hardware connects)
      ws.send(JSON.stringify({
        type: 'initial',
        nodes: NodeModel.getActiveNodes(),
      }));

      // Handle commands from dashboards (downlink)
      ws.on('message', (raw) => {
        try {
          const data = JSON.parse(raw.toString());
          if (data.cmd === 'ASSIGN_RESCUE') {
            this.sendDownlink(data.target);
            this.broadcast('rescue_assigned', { nodeId: data.target });
          }
        } catch (e) {
          console.error('Invalid dashboard message:', e);
        }
      });

      ws.on('close', () => {
        this.clients.delete(user.id);
        console.log(`Dashboard client disconnected (user ${user.id})`);
      });
    });
  }

  /** Connect (and automatically reconnect) to the hardware Gateway Hub */
  private connectToHub() {
    if (this.hubSocket) {
      try { this.hubSocket.close(); } catch {}
    }

    console.log(`Connecting to Gateway Hub at ${HUB_WS_URL}...`);
    this.hubSocket = new WebSocket(HUB_WS_URL);

    this.hubSocket.on('open', () => {
      console.log('✅ Connected to Gateway Hub – real‑time telemetry active');
    });

    this.hubSocket.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'telemetry_update' && Array.isArray(msg.nodes)) {
          // Store each node's vitals in the database (optional, but keeps history)
          for (const n of msg.nodes) {
            NodeModel.insertVitals(n.id, {
              hr: n.hr ?? 0,
              spo2: n.spo2 ?? 0,
              gForce: n.gForce ?? 0,
              battery: n.battery ?? 0,
              flags: n.flags ?? 0,
              lat: n.lat ?? 0,
              lng: n.lng ?? 0,
            });
          }
          // Push the latest state to all dashboard clients
          const activeNodes = NodeModel.getActiveNodes();
          this.broadcast('telemetry_update', { nodes: activeNodes });
        }
      } catch (e) {
        console.error('Failed to parse Hub message:', e);
      }
    });

    this.hubSocket.on('error', (err) => {
      console.error('Hub WebSocket error:', err.message);
    });

    this.hubSocket.on('close', () => {
      console.warn('⚠️ Gateway Hub disconnected – retrying in 5 seconds');
      this.hubSocket = null;
      setTimeout(() => this.connectToHub(), 5000);
    });
  }

  /** Send a downlink command to the Hub (to forward to a patient node) */
  private sendDownlink(nodeId: number) {
    if (this.hubSocket && this.hubSocket.readyState === WebSocket.OPEN) {
      this.hubSocket.send(JSON.stringify({ cmd: 'ASSIGN_RESCUE', target: nodeId }));
      console.log(`Downlink sent for Node ${nodeId}`);
    } else {
      console.warn(`Cannot send downlink – Hub not connected`);
    }
  }

  /** Broadcast a message to all connected dashboard clients */
  private broadcast(type: string, data: any) {
    const payload = JSON.stringify({ type, data });
    for (const [, ws] of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
}