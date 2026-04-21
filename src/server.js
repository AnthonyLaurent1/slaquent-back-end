import http from "node:http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import { apiRouter } from "./routes/api.routes.js";
import { registerChatGateway } from "./ws/chat.gateway.js";

export function createServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.static("public"));
  app.use("/api", apiRouter);

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  registerChatGateway(io);

  return { app, httpServer, io };
}
