const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const PORT = process.env.SOCKET_IO_PORT || 3000;

// Authentication middleware for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.sub;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join user-specific room
  socket.join(`user:${socket.userId}`);

  // Join role-specific room
  socket.join(`role:${socket.userRole}`);

  // Handle collection events
  socket.on("collection:created", (data) => {
    // Broadcast to managers and admin
    io.to(`role:admin`).emit("collection:new", data);
    io.to(`role:manager`).emit("collection:new", data);

    // Notify supplier owner
    if (data.supplierOwnerId) {
      io.to(`user:${data.supplierOwnerId}`).emit("collection:new", data);
    }
  });

  socket.on("collection:updated", (data) => {
    io.to(`role:admin`).emit("collection:update", data);
    io.to(`role:manager`).emit("collection:update", data);

    // Notify collector
    if (data.collectorId) {
      io.to(`user:${data.collectorId}`).emit("collection:update", data);
    }
  });

  socket.on("collection:approved", (data) => {
    // Notify collector
    io.to(`user:${data.collectorId}`).emit("collection:approved", data);
  });

  socket.on("collection:rejected", (data) => {
    // Notify collector
    io.to(`user:${data.collectorId}`).emit("collection:rejected", data);
  });

  // Handle payment events
  socket.on("payment:created", (data) => {
    io.to(`role:admin`).emit("payment:new", data);
    io.to(`role:manager`).emit("payment:new", data);
  });

  socket.on("payment:confirmed", (data) => {
    io.to(`user:${data.paidBy}`).emit("payment:confirmed", data);
  });

  socket.on("payment:cancelled", (data) => {
    io.to(`user:${data.paidBy}`).emit("payment:cancelled", data);
  });

  // Handle sync events
  socket.on("sync:request", (data) => {
    // Process sync request
    socket.emit("sync:response", {
      status: "processing",
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("sync:completed", (data) => {
    socket.emit("sync:status", {
      status: "completed",
      syncedItems: data.count,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error for user ${socket.userId}:`, error);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    connections: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

module.exports = { io, server };
