import { MessageRepository } from "../repositories/message.repository.js";
import { RoomRepository } from "../repositories/room.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { feedService } from "./feed.service.js";
import * as cache from "../cache/cache.service.js";

/**
 * Normalize two user identifiers in ascending order.
 *
 * @author Matéo Leroy ( LeroyM084 )
 * @date 2026-04-22
 * @param {number} firstUserId - First user identifier.
 * @param {number} secondUserId - Second user identifier.
 * @returns {number[]} Ordered pair of user identifiers.
 */
function normalizePair(firstUserId, secondUserId) {
  return firstUserId < secondUserId
    ? [firstUserId, secondUserId]
    : [secondUserId, firstUserId];
}

/**
 * Ensure a value is an integer.
 *
 * @author Matéo Leroy ( LeroyM084 )
 * @date 2026-04-22
 * @param {unknown} value - Value to validate.
 * @param {string} errorCode - Error code to throw on invalid input.
 * @returns {void} Nothing.
 */
function ensureInteger(value, errorCode) {
  if (!Number.isInteger(value)) {
    throw new TypeError(errorCode);
  }
}

/**
 * Serialize a message with a computed read flag.
 *
 * @author Matéo Leroy ( LeroyM084 )
 * @date 2026-04-22
 * @param {object} message - Message entity.
 * @returns {object} Serialized message.
 */
function serializeMessage(message) {
  return {
    ...message,
    isRead: Boolean(message.readAt),
  };
}

export class ChatService {
  /**
   * Create the chat service with repository dependencies.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @returns {void} Nothing.
   */
  constructor() {
    this.users = new UserRepository();
    this.rooms = new RoomRepository();
    this.messages = new MessageRepository();
  }

  /**
   * Register a user or return the existing one.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {string} username - Desired username.
   * @returns {Promise<object>} Created or existing user.
   */
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

  /**
   * List all users.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @returns {Promise<object[]>} Users ordered by repository rules.
   */
  async listUsers() {
    return this.users.list();
  }

  /**
   * Load a user or fail if it does not exist.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userId - User identifier.
   * @returns {Promise<object>} User entity.
   */
  async requireUser(userId) {
    ensureInteger(userId, "USER_NOT_FOUND");
    const user = await this.users.findById(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return user;
  }

  /**
   * Retrieve or create a direct room for two users.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} firstUserId - First participant identifier.
   * @param {number} secondUserId - Second participant identifier.
   * @returns {Promise<object>} Direct room entity.
   */
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

  /**
   * List rooms for a given user.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} userId - User identifier.
   * @returns {Promise<object[]>} Direct rooms for the user.
   */
  async listRoomsForUser(userId) {
    await this.requireUser(userId);
    return this.rooms.listForUser(userId);
  }

  /**
   * List messages for a room and mark them as read.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} roomId - Room identifier.
   * @param {number} userId - Requesting user identifier.
   * @param {number} limit - Maximum number of messages to return.
   * @returns {Promise<object[]>} Serialized messages.
   */
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

    const cacheKey = `room:${roomId}:messages:limit:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached.map(serializeMessage);
    }

    const messages = await this.messages.listByRoom(roomId, limit);
    const serialized = messages.map(serializeMessage);
    await cache.set(cacheKey, serialized, 60);
    return serialized;
  }

  /**
   * Create a direct message and update room metadata.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} senderId - Sender identifier.
   * @param {number} recipientId - Recipient identifier.
   * @param {string} content - Message content.
   * @returns {Promise<{room: object, message: object}>} Room and created message.
   */
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
      isPublic: false, 
    });

    await this.rooms.touch(room.id, message.id);
    await feedService.markPublicWithChance(message.id);

    // update recent cached list and invalidate page caches
    try {
      await cache.lpushTrim(`room:${room.id}:recent`, message, Number(100));
      // simple invalidation: delete first few page caches
      for (let p = 0; p < 3; p++) {
        await cache.del(`room:${room.id}:messages:limit:${(p + 1) * 50}`);
      }
      await cache.publish(`room:${room.id}:messages`, { type: 'message:new', payload: message });
    } catch (e) {
      // caching failures shouldn't block message creation
      console.warn('cache error', e?.message || e);
    }

    return {
      room,
      message: serializeMessage(message),
    };
  }

  /**
   * Load undelivered messages for a recipient.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} recipientId - Recipient identifier.
   * @returns {Promise<object[]>} Pending serialized messages.
   */
  async flushPendingMessages(recipientId) {
    await this.requireUser(recipientId);
    const messages = await this.messages.listPendingForRecipient(recipientId);
    return messages.map(serializeMessage);
  }

  /**
   * Mark a message as delivered.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} messageId - Message identifier.
   * @returns {Promise<object>} Updated message.
   */
  async markMessageDelivered(messageId) {
    ensureInteger(messageId, "MESSAGE_NOT_FOUND");
    return this.messages.markDelivered(messageId);
  }

  /**
   * Mark a message as read.
   *
   * @author Matéo Leroy ( LeroyM084 )
   * @date 2026-04-22
   * @param {number} messageId - Message identifier.
   * @returns {Promise<object>} Updated message.
   */
  async markMessageRead(messageId) {
    ensureInteger(messageId, "MESSAGE_NOT_FOUND");
    return this.messages.markRead(messageId);
  }
}
