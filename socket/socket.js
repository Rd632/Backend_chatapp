import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-chatapp-op3p.onrender.com",
];

// ✅ Enable CORS for REST API routes
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // required for cookies to work across domains
  })
);

// ✅ Enable JSON parsing if needed (optional but common)
app.use(express.json());

// ✅ Initialize socket.io server with proper CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Use Map for user socket tracking
const userSocketMap = new Map(); // userId => socketId

// ✅ Helper to get receiver's socket
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

// ✅ Socket.io connection
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`🔐 User ID ${userId} associated with socket ${socket.id}`);

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      userSocketMap.delete(userId);
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
  } else {
    console.warn("⚠️ Invalid userId in socket connection. Connection skipped.");
  }
});

export { app, io, server };
