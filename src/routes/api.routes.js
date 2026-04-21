import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";

export const apiRouter = Router();

apiRouter.get("/users", (req, res) => chatController.listUsers(req, res));
apiRouter.post("/users/register", (req, res) => chatController.registerUser(req, res));
apiRouter.get("/users/:userId/rooms", (req, res) => chatController.listRooms(req, res));
apiRouter.post("/rooms", (req, res) => chatController.getOrCreateRoom(req, res));
apiRouter.get("/rooms/:roomId/messages", (req, res) => chatController.listMessages(req, res));
