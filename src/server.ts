import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase } from './config/database';
import routes from './routes';
import { WebSocketService } from './services/websocket/WebSocketService';

async function start() {
  await initializeDatabase();
  const app = express();
  const server = http.createServer(app);
  app.use(cors());
  app.use(express.json());
  app.use('/api', routes);
  new WebSocketService(server);
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}
start();
