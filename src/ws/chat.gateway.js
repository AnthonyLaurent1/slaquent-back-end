import { chatService } from "../controllers/chat.controller.js";
import { PresenceManager } from "./presence.manager.js";

const presence = new PresenceManager();

function personalChannel(userId) {
  return `user:${userId}`;
}

function emitPresence(io, userId) {
  io.emit("presence:updated", {
    userId,
    online: presence.isOnline(userId),
  });
}

export function registerChatGateway(io) {
  io.on("connection", (socket) => {
    socket.on("session:register", async (payload, callback) => {
      try {
        const userId = Number(payload?.userId);
        await chatService.requireUser(userId);

        socket.data.userId = userId;
        presence.connect(userId, socket.id);
        socket.join(personalChannel(userId));

        const pendingMessages = await chatService.flushPendingMessages(userId);
        pendingMessages.forEach((message) => {
          socket.emit("message:received", message);
        });

        emitPresence(io, userId);
        callback?.({
          ok: true,
          pendingMessages: pendingMessages.length,
        });
      } catch (error) {
        callback?.({
          ok: false,
          error: error.message,
        });
      }
    });

    socket.on("message:send", async (payload, callback) => {
      try {
        const senderId = Number(payload?.senderId);
        const recipientId = Number(payload?.recipientId);
        const content = payload?.content;
        if (socket.data.userId !== senderId) {
          throw new Error("ROOM_ACCESS_DENIED");
        }

        const { room, message } = await chatService.createMessage(
          senderId,
          recipientId,
          content,
        );

        io.to(personalChannel(senderId)).emit("message:sent", {
          room,
          message,
        });

        io.to(personalChannel(recipientId)).emit("message:received", message);

        callback?.({
          ok: true,
          roomId: room.id,
          messageId: message.id,
        });
      } catch (error) {
        callback?.({
          ok: false,
          error: error.message,
        });
      }
    });

    socket.on("message:delivered", async (payload) => {
      const messageId = Number(payload?.messageId);
      if (!Number.isInteger(messageId)) {
        return;
      }

      await chatService.markMessageDelivered(messageId);
    });

    socket.on("message:read", async (payload) => {
      const messageId = Number(payload?.messageId);
      if (!Number.isInteger(messageId)) {
        return;
      }

      await chatService.markMessageRead(messageId);
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (!userId) {
        return;
      }

      presence.disconnect(userId, socket.id);
      emitPresence(io, userId);
    });
  });
}
