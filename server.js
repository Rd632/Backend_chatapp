import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

import compression from "compression";

// gzip compression to reduce memory use
app.use(compression());

dotenv.config();

const __dirname = path.resolve();
// PORT should be assigned after calling dotenv.config() because we need to access the env variables. Didn't realize while recording the video. Sorry for the confusion.
const PORT = process.env.PORT || 5000;

app.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// app.use(express.static(path.join(__dirname, "/frontend/vite-project/dist"), {
// 	maxAge: "1d", // Cache for 1 day
//   }));

// app.get("*", (req, res) => {
// 	res.sendFile(path.join(__dirname, "frontend","vite-project", "dist", "index.html"));
// });

setInterval(() => {
	const used = process.memoryUsage();
	console.log("Memory Usage:", {
	  rss: (used.rss / 1024 / 1024).toFixed(2) + " MB",
	  heapTotal: (used.heapTotal / 1024 / 1024).toFixed(2) + " MB",
	  heapUsed: (used.heapUsed / 1024 / 1024).toFixed(2) + " MB",
	});
  }, 10000); // every 10 sec
  
  	
server.listen(5000, () => {
	connectToMongoDB();
	console.log("Server Running on port 5000");
});