import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: any;

export async function initializeDatabase() {
  const SQL = await initSqlJs();
  const dbFile = path.join(__dirname, '../../pulsegrid.db');
  if (fs.existsSync(dbFile)) {
    const buffer = fs.readFileSync(dbFile);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','emergency','hospital_staff','ambulance_driver','patient'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER UNIQUE NOT NULL,
    patient_id INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'active',
    battery_level INTEGER DEFAULT 100,
    location_lat REAL,
    location_lng REAL,
    last_seen DATETIME
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS vitals_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id INTEGER REFERENCES nodes(id),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    heart_rate INTEGER,
    spo2 INTEGER,
    g_force REAL,
    battery_level INTEGER,
    status_register INTEGER,
    triage_color TEXT CHECK(triage_color IN ('GREEN','YELLOW','RED','BLACK'))
  )`);
  return db;
}

export function getDb() { return db; }

setInterval(() => {
  if (db) {
    const data = db.export();
    fs.writeFileSync(path.join(__dirname, '../../pulsegrid.db'), Buffer.from(data));
  }
}, 5000);
