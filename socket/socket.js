import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import Message from "../models/message.model";

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

// ✅ Handle socket connections
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`🔐 User ID ${userId} associated with socket ${socket.id}`);

    // Emit the updated online users list to all connected clients
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    // Listen for "sendMessage" event from clients
    socket.on("sendMessage", async (newMessage) => {
      try {
        // Save the message to your database
        const savedMessage = await saveMessageToDB(newMessage); // Replace with your actual DB logic

        // Emit the new message to the receiver
        const receiverSocketId = getReceiverSocketId(newMessage.receiverId);
        if (receiverSocketId && receiverSocketId !== socket.id) {
          io.to(receiverSocketId).emit("newMessage", savedMessage);
          console.log(`Message sent to receiver: ${newMessage.receiverId}`);
        }
      } catch (error) {
        console.error("Error while sending message:", error);
      }
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      userSocketMap.delete(userId);
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
  } else {
    console.warn("⚠️ Invalid userId in socket connection. Connection skipped.");
  }
});

// Helper function to save the message to the database (example)
const saveMessageToDB = async (message) => {
  const savedMessage = await Message.create({
    conversationId: message.conversationId,
    senderId: message.senderId,
    receiverId: message.receiverId,
    message: message.message,
  });
  // Simulate saving to DB and returning the saved message
  return savedMessage; // In a real app, save to DB and return the saved message
};



export { app, io, server };
