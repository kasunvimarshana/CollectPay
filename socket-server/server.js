import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";

const port = process.env.PORT || 6001;
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const redis = new Redis(redisUrl);

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);
});

redis.psubscribe("*", (err, count) => {
  if (err) {
    console.error("Redis psubscribe error", err);
  } else {
    console.log("Subscribed to Redis patterns");
  }
});

redis.on("pmessage", (pattern, channel, message) => {
  try {
    const payload = JSON.parse(message);
    io.emit(channel, payload);
  } catch (e) {
    console.error("Invalid message", e);
  }
});

httpServer.listen(port, () => {
  console.log(`Socket.IO server listening on ${port}`);
});
