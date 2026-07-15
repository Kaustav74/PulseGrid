import { getDb } from '../config/database';
import bcrypt from 'bcrypt';

const getStr = (val: any) => (val ? String(val) : '');

export const UserModel = {
  create: async (u: any) => {
    const hash = await bcrypt.hash(u.password, 10);
    const db = getDb();
    db.run('INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?,?,?,?,?)',
      [u.username, u.email, hash, u.full_name, u.role]);
    const res = db.exec('SELECT last_insert_rowid() as id');
    return UserModel.findById(res[0].values[0][0] as number);
  },
  findById: (id: number) => {
    const stmt = getDb().prepare('SELECT * FROM users WHERE id=?');
    stmt.bind([id]);
    if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return { ...row, full_name: getStr(row.full_name) }; }
    stmt.free(); return null;
  },
  findByUsername: (username: string) => {
    const stmt = getDb().prepare('SELECT * FROM users WHERE username=?');
    stmt.bind([username]);
    if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return { ...row, full_name: getStr(row.full_name) }; }
    stmt.free(); return null;
  },
  validatePassword: (user: any, password: string) => bcrypt.compare(password, user.password_hash),
};

export const NodeModel = {
  getActiveNodes: () => {
    const rows = getDb().exec("SELECT * FROM nodes WHERE status='active'");
    if (!rows.length) return [];
    const cols = rows[0].columns;
    return rows[0].values.map(row => Object.fromEntries(cols.map((c,i) => [c, row[i]])));
  },
  insertVitals: (nodeId: number, data: any) => {
    const db = getDb();
    const stmt = db.prepare('SELECT id FROM nodes WHERE node_id=?');
    stmt.bind([nodeId]);
    if (!stmt.step()) { stmt.free(); return; }
    const node = stmt.getAsObject(); stmt.free();
    db.run('INSERT INTO vitals_history (node_id, heart_rate, spo2, g_force, battery_level, status_register) VALUES (?,?,?,?,?,?)',
      [node.id, data.hr, data.spo2, data.gForce, data.battery, data.flags]);
    db.run('UPDATE nodes SET battery_level=?, last_seen=CURRENT_TIMESTAMP, location_lat=?, location_lng=? WHERE node_id=?',
      [data.battery, data.lat, data.lng, nodeId]);
  },
};

export const TriageModel = {
  getCounts: () => {
    const db = getDb();
    const rows = db.exec(`
      SELECT triage_color, COUNT(*) as cnt
      FROM vitals_history v1
      WHERE timestamp = (SELECT MAX(timestamp) FROM vitals_history v2 WHERE v2.node_id = v1.node_id)
      GROUP BY triage_color
    `);
    const counts: any = { GREEN:0, YELLOW:0, RED:0, BLACK:0 };
    if (rows.length) {
      rows[0].values.forEach((row: any[]) => {
        const color = getStr(row[0]).toUpperCase();
        if (counts.hasOwnProperty(color)) counts[color] = Number(row[1]);
      });
    }
    return counts;
  },
};
