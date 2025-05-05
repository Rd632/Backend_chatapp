import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors"; 

const app = express();

const server = http.createServer(app);

// Use a Set origin list or a single origin string
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000" , "https://frontend-chatapp-op3p.onrender.com"], // frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: origin,
  credentials: true, // Allow cookies
}));

// Use Map for cleaner, safer socket tracking
const userSocketMap = new Map(); // userId => socketId

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`🔐 User ID ${userId} associated with socket ${socket.id}`);

    // Send online users to everyone
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    // On disconnect
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
