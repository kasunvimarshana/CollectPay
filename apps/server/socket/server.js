// Minimal Socket.IO server to broadcast Laravel domain events
// Open-source, MIT-friendly dependencies only
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  // no-op; clients subscribe implicitly to broadcast events
});

// HTTP endpoint for Laravel to emit events
app.post("/emit", (req, res) => {
  const { event, data } = req.body || {};
  if (!event) return res.status(400).json({ error: "event required" });
  io.emit(event, data || {});
  res.json({ ok: true });
});

const PORT = process.env.PORT || 6001;
server.listen(PORT, () => console.log(`Socket server on ${PORT}`));
