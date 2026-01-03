import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
// Configuración de WebSockets de alto rendimiento
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ['websocket', 'polling'] 
});

// Cliente Redis para Suscripción
const redisSubscriber = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisSubscriber.on('error', (err) => console.error('Redis Client Error', err));

async function startServer() {
  await redisSubscriber.connect();
  console.log("🔗 Node API connected to Redis");

  // Suscribirse al canal que alimenta Rust
  await redisSubscriber.subscribe('market_updates', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Lógica de negocio simulada: Detección de anomalías antes de enviar al frontend
      if (data.volatility_index > 0.8) {
        data.alert = "HIGH VOLATILITY DETECTED";
      }

      // Emitir al frontend vía WebSocket
      io.emit('ticker_update', data);
      
    } catch (e) {
      console.error("Error parsing message", e);
    }
  });

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
  });
}

startServer();
