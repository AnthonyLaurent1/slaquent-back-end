import { ChatService } from "../services/chat.service.js";

const chatService = new ChatService();

function parseNumericParam(value) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function handleError(error, res) {
  const errors = {
    USERNAME_REQUIRED: 400,
    USER_NOT_FOUND: 404,
    SELF_CHAT_FORBIDDEN: 400,
    ROOM_NOT_FOUND: 404,
    ROOM_ACCESS_DENIED: 403,
    MESSAGE_CONTENT_REQUIRED: 400,
    MESSAGE_NOT_FOUND: 404,
  };

  const status = errors[error.message] ?? 500;
  res.status(status).json({
    error: error.message,
  });
}

export class ChatController {
  async registerUser(req, res) {
    try {
      const user = await chatService.registerUser(req.body.username);
      res.status(201).json(user);
    } catch (error) {
      handleError(error, res);
    }
  }

  async listUsers(req, res) {
    try {
      const users = await chatService.listUsers();
      res.json(users);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getOrCreateRoom(req, res) {
    try {
      const currentUserId = parseNumericParam(req.body.currentUserId);
      const targetUserId = parseNumericParam(req.body.targetUserId);
      const room = await chatService.getOrCreateDirectRoom(currentUserId, targetUserId);
      res.json(room);
    } catch (error) {
      handleError(error, res);
    }
  }

  async listRooms(req, res) {
    try {
      const userId = parseNumericParam(req.params.userId);
      const rooms = await chatService.listRoomsForUser(userId);
      res.json(rooms);
    } catch (error) {
      handleError(error, res);
    }
  }

  async listMessages(req, res) {
    try {
      const roomId = parseNumericParam(req.params.roomId);
      const userId = parseNumericParam(req.query.userId);
      const limit = parseNumericParam(req.query.limit) ?? 50;
      const messages = await chatService.listMessages(roomId, userId, limit);
      res.json(messages);
    } catch (error) {
      handleError(error, res);
    }
  }
}

export const chatController = new ChatController();
export { chatService };
