import { MessageRepository } from "../repositories/message.repository.js";
import { RoomRepository } from "../repositories/room.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

function normalizePair(firstUserId, secondUserId) {
  return firstUserId < secondUserId
    ? [firstUserId, secondUserId]
    : [secondUserId, firstUserId];
}

function ensureInteger(value, errorCode) {
  if (!Number.isInteger(value)) {
    throw new TypeError(errorCode);
  }
}

function serializeMessage(message) {
  return {
    ...message,
    isRead: Boolean(message.readAt),
  };
}

export class ChatService {
  constructor() {
    this.users = new UserRepository();
    this.rooms = new RoomRepository();
    this.messages = new MessageRepository();
  }

  async registerUser(username) {
    const trimmedUsername = username?.trim();

    if (!trimmedUsername) {
      throw new Error("USERNAME_REQUIRED");
    }

    const existingUser = await this.users.findByUsername(trimmedUsername);
    if (existingUser) {
      return existingUser;
    }

    return this.users.create(trimmedUsername);
  }

  async listUsers() {
    return this.users.list();
  }

  async requireUser(userId) {
    ensureInteger(userId, "USER_NOT_FOUND");
    const user = await this.users.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user;
  }

  async getOrCreateDirectRoom(firstUserId, secondUserId) {
    ensureInteger(firstUserId, "USER_NOT_FOUND");
    ensureInteger(secondUserId, "USER_NOT_FOUND");

    if (firstUserId === secondUserId) {
      throw new Error("SELF_CHAT_FORBIDDEN");
    }

    const [userAId, userBId] = normalizePair(firstUserId, secondUserId);
    const [userA, userB] = await Promise.all([
      this.users.findById(userAId),
      this.users.findById(userBId),
    ]);

    if (!userA || !userB) {
      throw new Error("USER_NOT_FOUND");
    }

    const existingRoom = await this.rooms.findByParticipants(userAId, userBId);
    if (existingRoom) {
      return existingRoom;
    }

    return this.rooms.create(userAId, userBId);
  }

  async listRoomsForUser(userId) {
    await this.requireUser(userId);
    return this.rooms.listForUser(userId);
  }

  async listMessages(roomId, userId, limit) {
    ensureInteger(roomId, "ROOM_NOT_FOUND");
    await this.requireUser(userId);
    const room = await this.rooms.findById(roomId);
    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    const isParticipant = room.userAId === userId || room.userBId === userId;
    if (!isParticipant) {
      throw new Error("ROOM_ACCESS_DENIED");
    }

    await this.messages.markRoomMessagesRead(roomId, userId);

    const messages = await this.messages.listByRoom(roomId, limit);
    return messages.map(serializeMessage);
  }

  async createMessage(senderId, recipientId, content) {
    ensureInteger(senderId, "USER_NOT_FOUND");
    ensureInteger(recipientId, "USER_NOT_FOUND");

    const trimmedContent = content?.trim();
    if (!trimmedContent) {
      throw new Error("MESSAGE_CONTENT_REQUIRED");
    }

    const room = await this.getOrCreateDirectRoom(senderId, recipientId);
    const message = await this.messages.create({
      roomId: room.id,
      senderId,
      recipientId,
      content: trimmedContent,
    });

    await this.rooms.touch(room.id, message.id);

    return {
      room,
      message: serializeMessage(message),
    };
  }

  async flushPendingMessages(recipientId) {
    await this.requireUser(recipientId);
    const messages = await this.messages.listPendingForRecipient(recipientId);
    return messages.map(serializeMessage);
  }

  async markMessageDelivered(messageId) {
    ensureInteger(messageId, "MESSAGE_NOT_FOUND");
    return this.messages.markDelivered(messageId);
  }

  async markMessageRead(messageId) {
    ensureInteger(messageId, "MESSAGE_NOT_FOUND");
    return this.messages.markRead(messageId);
  }
}
