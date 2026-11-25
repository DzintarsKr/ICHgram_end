import "dotenv/config";
import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import connectDB from "./src/config/db.js";
import {
  errorHandler,
  notFound,
} from "./src/middlewares/errorMiddleware.js";
import authRoutes from "./src/routes/authRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import followRoutes from "./src/routes/followRoutes.js";
import likeRoutes from "./src/routes/likeRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import { initSocketServer } from "./src/sockets/socketServer.js";

const PORT = process.env.PORT || 5000;
const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../client/dist");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", notFound);

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use(errorHandler);

await connectDB();

const httpServer = createServer(app);
initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
