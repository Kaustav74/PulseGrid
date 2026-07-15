import { initializeDatabase, getDb } from './config/database';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

async function seed() {
  await initializeDatabase();
  const db = getDb();

  const users = [
    { username: 'admin', password: 'admin123', full_name: 'Admin', role: 'admin' },
    { username: 'emergency1', password: 'er123', full_name: 'Dr. Sarah Connor', role: 'emergency' },
    { username: 'hospital1', password: 'hs123', full_name: 'Nurse Joy', role: 'hospital_staff' },
    { username: 'ambulance1', password: 'am123', full_name: 'Driver Bob', role: 'ambulance_driver' },
    { username: 'patient1', password: 'pt123', full_name: 'John Doe', role: 'patient' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    db.run('INSERT OR IGNORE INTO users (username, email, password_hash, full_name, role) VALUES (?,?,?,?,?)',
      [u.username, u.username + '@pulsegrid.local', hash, u.full_name, u.role]);
  }

  for (let i = 1; i <= 5; i++) {
    db.run('INSERT OR IGNORE INTO nodes (node_id, status, battery_level, location_lat, location_lng) VALUES (?,?,?,?,?)',
      [i, 'active', 90 - i * 5, Math.random() * 200 - 100, Math.random() * 200 - 100]);
  }

  // ✅ Force save the database before exiting
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbFile = path.join(__dirname, '../pulsegrid.db');
  fs.writeFileSync(dbFile, buffer);
  console.log('Seed complete. Users:');
  users.forEach(u => console.log(`${u.role}: ${u.username} / ${u.password}`));
  process.exit(0);
}

seed();